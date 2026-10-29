import db from "../config/database.js";
import { calculateChurnRisk, simulateWhatIf, attachIntelligence } from "../services/predictionEngine.js";
import { logPredictionToMysql } from "../config/mysql.js";

const FASTAPI_URL = process.env.FASTAPI_URL || "http://127.0.0.1:8000";

/**
 * Format customer payload for FastAPI microservice schema
 */
function toFastApiPayload(customer) {
  const tenure = Number(customer.tenure || customer.tenureMonths || 12);
  const monthlyCharges = Number(customer.monthlyCharges || customer.monthlyChargesINR || 499);
  const totalCharges = Number(
    customer.totalCharges || customer.totalChargesINR || (monthlyCharges * Math.max(1, tenure))
  );

  return {
    customer_id: String(customer.id || customer.customerId || "SUB-001"),
    name: customer.name || "Subscriber",
    platform: customer.platform || "Netflix",
    subscription_plan: customer.plan || customer.subscriptionPlan || "Standard 1080p",
    device_type: customer.deviceType || customer.device_type || "Smart TV",
    tenure: tenure,
    contract: customer.contract || customer.contractType || "Monthly",
    payment_method: customer.paymentMethod || customer.payment_method || "UPI AutoPay",
    weekly_watch_hours: Number(customer.watchHoursPerWeek || customer.weeklyWatchHours || 15.0),
    support_tickets: Number(customer.supportTickets !== undefined ? customer.supportTickets : 0),
    num_profiles: Number(customer.numProfiles || customer.num_profiles || 2),
    monthly_charges: monthlyCharges,
    total_charges: totalCharges
  };
}

/**
 * Real-time AI Churn Prediction Endpoint
 * Queries the active Python FastAPI / MLflow trained model pipeline
 */
export async function predictChurn(req, res, next) {
  try {
    const customer = req.body;
    if (!customer) {
      return res.status(400).json({
        success: false,
        message: "Customer metrics and attributes are required."
      });
    }

    let prediction = null;
    let engineSource = "FastAPI / MLflow Trained Model";

    // Attempt real-time inference via FastAPI Python microservice
    try {
      const payload = toFastApiPayload(customer);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const fastApiResponse = await fetch(`${FASTAPI_URL}/api/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (fastApiResponse.ok) {
        const mlData = await fastApiResponse.json();
        prediction = {
          probability: mlData.churn_probability,
          prediction: mlData.prediction,
          riskLevel: mlData.risk_level,
          riskColor: mlData.risk_color,
          confidence: mlData.confidence,
          modelVersion: mlData.model_version,
          topFactors: mlData.top_factors.map((f) => (typeof f === "string" ? { name: f, impact: "High", type: "negative" } : f)),
          positiveDrivers: mlData.positive_drivers.map((d) => (typeof d === "string" ? { name: d, impact: "Retention", type: "positive" } : d)),
          recommendations: mlData.recommendations,
          source: engineSource
        };
      }
    } catch (err) {
      // FastAPI offline or unreachable - graceful fallback to local calibrated engine
      console.warn(`[MLOps Integration] FastAPI inference notice: ${err.message}. Using calibrated fallback.`);
    }

    // Fallback if FastAPI is offline
    if (!prediction) {
      prediction = calculateChurnRisk(customer);
      prediction.source = "Local Calibrated Heuristic Engine (FastAPI Offline)";
    }

    // Asynchronously log to MySQL predictions table for SQL Workbench visibility
    logPredictionToMysql({
      customerId: customer.id || customer.customerId,
      customerName: customer.name,
      probability: prediction.probability,
      riskLevel: prediction.riskLevel,
      riskColor: prediction.riskColor,
      confidence: prediction.confidence,
      topFactors: prediction.topFactors,
      positiveDrivers: prediction.positiveDrivers,
      recommendations: prediction.recommendations
    }).catch(() => {});

    return res.json({
      success: true,
      data: {
        customerSummary: {
          name: customer.name || "Evaluation Profile",
          tenure: customer.tenure,
          monthlyCharges: customer.monthlyCharges,
          contract: customer.contract,
          paymentMethod: customer.paymentMethod
        },
        prediction
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * What-If Simulation Endpoint
 * Queries FastAPI simulator or computes retention delta
 */
export async function simulateScenario(req, res, next) {
  try {
    const { customerId, customerData, overrides } = req.body;

    let baseCustomer = customerData;
    if (!baseCustomer && customerId) {
      baseCustomer = db.findCustomerById(customerId);
    }

    if (!baseCustomer) {
      return res.status(400).json({
        success: false,
        message: "Baseline customer profile or customerId is required."
      });
    }

    if (!overrides) {
      return res.status(400).json({
        success: false,
        message: "Simulation overrides (e.g. contract, monthlyCharges, paymentMethod) are required."
      });
    }

    let simulation = null;

    // Try FastAPI simulator endpoint
    try {
      const fastApiPayload = {
        customer_id: String(baseCustomer.id || customerId || "SIM-001"),
        customer: toFastApiPayload(baseCustomer),
        overrides: overrides
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const fastApiResponse = await fetch(`${FASTAPI_URL}/api/predict/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fastApiPayload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (fastApiResponse.ok) {
        const simData = await fastApiResponse.json();
        simulation = {
          currentRisk: {
            probability: simData.baseline.churn_probability,
            riskLevel: simData.baseline.risk_level,
            riskColor: simData.baseline.risk_color,
            confidence: simData.baseline.confidence,
            topFactors: simData.baseline.top_factors,
            positiveDrivers: simData.baseline.positive_drivers,
            recommendations: simData.baseline.recommendations,
            source: "FastAPI / MLflow Model"
          },
          newRisk: {
            probability: simData.simulated.churn_probability,
            riskLevel: simData.simulated.risk_level,
            riskColor: simData.simulated.risk_color,
            confidence: simData.simulated.confidence,
            topFactors: simData.simulated.top_factors,
            positiveDrivers: simData.simulated.positive_drivers,
            recommendations: simData.simulated.recommendations,
            source: "FastAPI / MLflow Model"
          },
          riskReduction: simData.probability_delta,
          isImprovement: simData.risk_reduced,
          protectedArr: simData.protected_revenue_inr,
          simulationNotes: simData.summary
        };
      }
    } catch (err) {
      console.warn(`[MLOps Integration] FastAPI simulator notice: ${err.message}. Using local simulator.`);
    }

    if (!simulation) {
      simulation = simulateWhatIf(baseCustomer, overrides);
    }

    return res.json({
      success: true,
      data: simulation
    });
  } catch (err) {
    next(err);
  }
}
