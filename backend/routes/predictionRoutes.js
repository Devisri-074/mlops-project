import { Router } from "express";
import { predictChurn, simulateScenario } from "../controllers/predictionController.js";

const router = Router();

// Real-time AI prediction & what-if simulator
router.post("/churn", predictChurn);
router.post("/simulate", simulateScenario);

export default router;
