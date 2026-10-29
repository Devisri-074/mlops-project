import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const poolConfig = {
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "churnwise_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 4000
};

let pool = null;
let isConnected = false;

export async function getMysqlPool() {
  if (!pool) {
    try {
      pool = mysql.createPool(poolConfig);
      // Test connection
      const connection = await pool.getConnection();
      isConnected = true;
      connection.release();
      console.log(`🐬 [MySQL] Successfully connected to MySQL database '${poolConfig.database}' on ${poolConfig.host}:${poolConfig.port}`);
    } catch (err) {
      isConnected = false;
      console.log(`ℹ️  [MySQL] Local MySQL server not connected (${err.code || err.message}). Operating in JSON store mode.`);
    }
  }
  return isConnected ? pool : null;
}

export async function logPredictionToMysql({ customerId, customerName, probability, riskLevel, riskColor, confidence, topFactors, positiveDrivers, recommendations }) {
  try {
    const dbPool = await getMysqlPool();
    if (!dbPool) return;

    await dbPool.query(
      `INSERT INTO predictions (customer_id, customer_name, churn_probability, risk_level, risk_color, confidence, top_factors, positive_drivers, recommendations)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        customerId || null,
        customerName || "Evaluation Profile",
        probability || 0,
        riskLevel || "Low Risk",
        riskColor || "green",
        confidence || 94,
        JSON.stringify(topFactors || []),
        JSON.stringify(positiveDrivers || []),
        JSON.stringify(recommendations || [])
      ]
    ).catch(() => {});
  } catch (err) {
    // Ignore if optional table is not present
  }
}

export async function syncCustomerToMysql(customer) {
  try {
    const dbPool = await getMysqlPool();
    if (!dbPool) return;

    const churnVal = (customer.churn || "Active").toUpperCase() === "CHURNED" ? "Churned" : "Active";
    const platformVal = customer.platform || "Netflix";
    const now = new Date();

    // Upsert with platform support
    await dbPool.query(
      `INSERT INTO customers (
        id, name, email, phone, platform, company, plan, subscriptionPlan, deviceType,
        age, gender, tenure, monthlyCharges, totalCharges, contract, paymentMethod,
        supportTickets, watchHoursPerWeek, numProfiles, streamingTV, streamingMovies, downloadOffline,
        churn, risk_score, risk_level, joinedDate
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        name=VALUES(name), email=VALUES(email), phone=VALUES(phone), platform=VALUES(platform), company=VALUES(company),
        plan=VALUES(plan), subscriptionPlan=VALUES(subscriptionPlan), deviceType=VALUES(deviceType),
        age=VALUES(age), gender=VALUES(gender), tenure=VALUES(tenure), monthlyCharges=VALUES(monthlyCharges),
        totalCharges=VALUES(totalCharges), contract=VALUES(contract), paymentMethod=VALUES(paymentMethod),
        supportTickets=VALUES(supportTickets), watchHoursPerWeek=VALUES(watchHoursPerWeek),
        numProfiles=VALUES(numProfiles), streamingTV=VALUES(streamingTV), streamingMovies=VALUES(streamingMovies),
        downloadOffline=VALUES(downloadOffline), churn=VALUES(churn), risk_score=VALUES(risk_score),
        risk_level=VALUES(risk_level)`,
      [
        customer.id,
        customer.name,
        customer.email || "",
        customer.phone || "",
        platformVal,
        customer.company || `${platformVal} Subscriber`,
        customer.plan || customer.subscriptionPlan || "Standard",
        customer.subscriptionPlan || customer.plan || "Standard",
        customer.deviceType || "Smart TV",
        customer.age || 28,
        customer.gender || "Male",
        customer.tenure || 1,
        customer.monthlyCharges || customer.monthly_charges || 499,
        customer.totalCharges || customer.total_charges || 499,
        customer.contract || "Annual",
        customer.paymentMethod || customer.payment_method || "UPI AutoPay",
        customer.supportTickets || customer.support_tickets || 0,
        customer.watchHoursPerWeek || customer.watch_hours_per_week || 15.0,
        customer.numProfiles || customer.num_profiles || 2,
        customer.streamingTV || "Yes",
        customer.streamingMovies || "Yes",
        customer.downloadOffline || "Yes",
        churnVal,
        customer.riskScore || customer.risk_score || 25,
        customer.riskLevel || customer.risk_level || "Low Risk",
        customer.joinedDate || now.toISOString().split("T")[0]
      ]
    ).catch(async () => {
      // Fallback if platform column not added yet
      try {
        await dbPool.query(
          `INSERT INTO customers (id, name, email, phone, company, plan, deviceType, age, gender, tenure, monthlyCharges, totalCharges, contract, paymentMethod, supportTickets, watchHoursPerWeek, numProfiles, churn, joinedDate)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE name=VALUES(name), churn=VALUES(churn)`,
          [
            customer.id, customer.name, customer.email, customer.phone, customer.company,
            customer.plan, customer.deviceType, customer.age, customer.gender, customer.tenure,
            customer.monthlyCharges, customer.totalCharges, customer.contract, customer.paymentMethod,
            customer.supportTickets, customer.watchHoursPerWeek, customer.numProfiles, churnVal,
            customer.joinedDate || now.toISOString().split("T")[0]
          ]
        );
      } catch (err2) {
        // Soft fallback
      }
    });
  } catch (err) {
    console.error("[MySQL] Failed to sync customer to MySQL:", err.message);
  }
}

export default { getMysqlPool, logPredictionToMysql, syncCustomerToMysql };
