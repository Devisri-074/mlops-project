import db from "../config/database.js";
import { attachIntelligence } from "../services/predictionEngine.js";

export function getDashboardStats(req, res, next) {
  try {
    const customers = db.getCustomers().map(attachIntelligence);
    const total = customers.length;
    const churned = customers.filter((c) => (c.churn || "").toUpperCase() === "CHURNED").length;
    const active = total - churned;
    const churnRate = total ? Math.round((churned / total) * 100) : 0;

    const totalMonthlyRevenue = customers.reduce(
      (sum, c) => sum + ((c.churn || "").toUpperCase() === "ACTIVE" ? Number(c.monthlyCharges || 0) : 0),
      0
    );
    const totalARR = totalMonthlyRevenue * 12;

    const highRiskCustomers = customers
      .filter((c) => (c.churn || "").toUpperCase() === "ACTIVE" && (c.riskScore || 0) >= 50)
      .sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0));

    const atRiskMonthlyRevenue = highRiskCustomers.reduce(
      (sum, c) => sum + Number(c.monthlyCharges || 0),
      0
    );
    const atRiskARR = atRiskMonthlyRevenue * 12;

    const avgWatchHours = total
      ? Math.round((customers.reduce((s, c) => s + Number(c.watchHoursPerWeek || 15), 0) / total) * 10) / 10
      : 18.5;

    // Multi-Platform Breakdown
    const platforms = ["Netflix", "Amazon Prime Video", "Spotify", "JioHotstar"].map((p) => {
      const pTotal = customers.filter((c) => (c.platform || "Netflix") === p).length;
      const pChurned = customers.filter((c) => (c.platform || "Netflix") === p && (c.churn || "").toUpperCase() === "CHURNED").length;
      return {
        platform: p,
        total: pTotal,
        active: pTotal - pChurned,
        churned: pChurned,
        churnRate: pTotal ? Math.round((pChurned / pTotal) * 100) : 0
      };
    });

    return res.json({
      success: true,
      data: {
        totalCustomers: total,
        activeCustomers: active,
        churnedCustomers: churned,
        churnRate,
        avgWatchHours,
        totalMonthlyRevenue,
        totalARR,
        atRiskMonthlyRevenue,
        atRiskARR,
        highRiskCount: highRiskCustomers.length,
        highRiskCustomers: highRiskCustomers.slice(0, 5),
        platforms
      }
    });
  } catch (err) {
    next(err);
  }
}

export function getAnalyticsTrends(req, res, next) {
  try {
    const customers = db.getCustomers().map(attachIntelligence);
    const total = customers.length;
    const churned = customers.filter((x) => (x.churn || "").toUpperCase() === "CHURNED").length;
    const active = total - churned;
    const churnRate = total ? Math.round((churned / total) * 100) : 0;

    // Multi-Platform Comparison Breakdown
    const platformBreakdown = [
      {
        name: "Netflix",
        Active: customers.filter((c) => (c.platform || "Netflix") === "Netflix" && (c.churn || "").toUpperCase() !== "CHURNED").length,
        Churned: customers.filter((c) => (c.platform || "Netflix") === "Netflix" && (c.churn || "").toUpperCase() === "CHURNED").length
      },
      {
        name: "Amazon Prime Video",
        Active: customers.filter((c) => c.platform === "Amazon Prime Video" && (c.churn || "").toUpperCase() !== "CHURNED").length,
        Churned: customers.filter((c) => c.platform === "Amazon Prime Video" && (c.churn || "").toUpperCase() === "CHURNED").length
      },
      {
        name: "Spotify",
        Active: customers.filter((c) => c.platform === "Spotify" && (c.churn || "").toUpperCase() !== "CHURNED").length,
        Churned: customers.filter((c) => c.platform === "Spotify" && (c.churn || "").toUpperCase() === "CHURNED").length
      },
      {
        name: "JioHotstar",
        Active: customers.filter((c) => c.platform === "JioHotstar" && (c.churn || "").toUpperCase() !== "CHURNED").length,
        Churned: customers.filter((c) => c.platform === "JioHotstar" && (c.churn || "").toUpperCase() === "CHURNED").length
      }
    ];

    // Contract / Billing Pass Breakdown
    const contractBreakdown = [
      {
        name: "Monthly Pass",
        Active: customers.filter((c) => (c.contract === "Monthly" || c.contract === "Monthly Pass") && (c.churn || "").toUpperCase() === "ACTIVE").length,
        Churned: customers.filter((c) => (c.contract === "Monthly" || c.contract === "Monthly Pass") && (c.churn || "").toUpperCase() === "CHURNED").length
      },
      {
        name: "Annual Pass",
        Active: customers.filter((c) => (c.contract === "Annual" || c.contract === "Annual Pass") && (c.churn || "").toUpperCase() === "ACTIVE").length,
        Churned: customers.filter((c) => (c.contract === "Annual" || c.contract === "Annual Pass") && (c.churn || "").toUpperCase() === "CHURNED").length
      }
    ];

    // Device Breakdown
    const deviceBreakdown = [
      { name: "Smart TV (4K/OLED)", total: customers.filter((c) => (c.deviceType || "").includes("TV")).length },
      { name: "Mobile App (iOS/Android)", total: customers.filter((c) => (c.deviceType || "").includes("Mobile") || (c.deviceType || "").includes("iPhone")).length },
      { name: "Streaming Stick / Console", total: customers.filter((c) => (c.deviceType || "").includes("Stick") || (c.deviceType || "").includes("Apple") || (c.deviceType || "").includes("PlayStation")).length },
      { name: "iPad / Smart Speaker / Web", total: customers.filter((c) => (c.deviceType || "").includes("iPad") || (c.deviceType || "").includes("Speaker") || (c.deviceType || "").includes("Browser") || (c.deviceType || "").includes("Mac")).length }
    ];

    // Activity Hours Cohort vs Churn
    const watchTimeCurve = [
      { range: "< 4 hrs/wk", total: customers.filter((c) => Number(c.watchHoursPerWeek || 0) < 4).length, churned: customers.filter((c) => Number(c.watchHoursPerWeek || 0) < 4 && (c.churn || "").toUpperCase() === "CHURNED").length },
      { range: "4–10 hrs/wk", total: customers.filter((c) => Number(c.watchHoursPerWeek || 0) >= 4 && Number(c.watchHoursPerWeek || 0) < 10).length, churned: customers.filter((c) => Number(c.watchHoursPerWeek || 0) >= 4 && Number(c.watchHoursPerWeek || 0) < 10 && (c.churn || "").toUpperCase() === "CHURNED").length },
      { range: "10–20 hrs/wk", total: customers.filter((c) => Number(c.watchHoursPerWeek || 0) >= 10 && Number(c.watchHoursPerWeek || 0) < 20).length, churned: customers.filter((c) => Number(c.watchHoursPerWeek || 0) >= 10 && Number(c.watchHoursPerWeek || 0) < 20 && (c.churn || "").toUpperCase() === "CHURNED").length },
      { range: "20+ hrs/wk", total: customers.filter((c) => Number(c.watchHoursPerWeek || 0) >= 20).length, churned: customers.filter((c) => Number(c.watchHoursPerWeek || 0) >= 20 && (c.churn || "").toUpperCase() === "CHURNED").length }
    ];

    // Risk Distribution
    const riskDistribution = {
      lowRisk: customers.filter((c) => c.riskLevel === "Low Risk").length,
      moderateRisk: customers.filter((c) => c.riskLevel === "Moderate Risk").length,
      highRisk: customers.filter((c) => c.riskLevel === "High Risk").length,
      criticalRisk: customers.filter((c) => c.riskLevel === "Critical Risk").length
    };

    return res.json({
      success: true,
      data: {
        summary: {
          total,
          active,
          churned,
          churnRate
        },
        platformBreakdown,
        contractBreakdown,
        deviceBreakdown,
        watchTimeCurve,
        riskDistribution
      }
    });
  } catch (err) {
    next(err);
  }
}
