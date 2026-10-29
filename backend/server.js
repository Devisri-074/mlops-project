import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import predictionRoutes from "./routes/predictionRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import { notFoundHandler, globalErrorHandler } from "./middleware/errorHandler.js";
import db from "./config/database.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend clients (Vite default :5173, etc.)
app.use(
  cors({
    origin: "*", // Allows requests from local Vite development servers and production origins
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// Body Parsers & Logger
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// Health Check Endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    service: "ChurnWise Enterprise REST API",
    version: "2.0.0",
    timestamp: new Date().toISOString(),
    metrics: {
      totalCustomers: db.getCustomers().length,
      registeredAccounts: db.getAccounts().length
    }
  });
});

// Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/predict", predictionRoutes);
app.use("/api/dashboard", analyticsRoutes);
app.use("/api/analytics", analyticsRoutes);

// Catch-all & Error Middleware
app.use(notFoundHandler);
app.use(globalErrorHandler);

// Start server
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 ChurnWise Backend Server is running!`);
    console.log(`📍 REST API URL: http://localhost:${PORT}`);
    console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
    console.log(`👥 Auth routes:  http://localhost:${PORT}/api/auth`);
    console.log(`📊 Customers:    http://localhost:${PORT}/api/customers`);
    console.log(`🤖 ML Predict:   http://localhost:${PORT}/api/predict/churn`);
    console.log(`📈 Analytics:    http://localhost:${PORT}/api/analytics/trends`);
    console.log(`======================================================\n`);
  });
}

export default app;
// Database reloaded with multi-platform streaming seed data
