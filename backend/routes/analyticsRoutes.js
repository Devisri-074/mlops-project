import { Router } from "express";
import { getDashboardStats, getAnalyticsTrends } from "../controllers/analyticsController.js";

const router = Router();

router.get("/stats", getDashboardStats);
router.get("/trends", getAnalyticsTrends);

export default router;
