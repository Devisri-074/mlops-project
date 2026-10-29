import { Router } from "express";
import {
  login,
  signup,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  revokeSession
} from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// Public routes
router.post("/login", login);
router.post("/signup", signup);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Protected routes
router.get("/me", authenticate, getMe);
router.put("/profile", authenticate, updateProfile);
router.post("/change-password", authenticate, changePassword);
router.delete("/sessions/:sessionId", authenticate, revokeSession);

export default router;
