import { Router } from "express";
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  batchDeleteCustomers,
  batchUpdateStatus,
  exportCSV,
  resetSeed
} from "../controllers/customerController.js";
import { authenticate, authorizeRoles } from "../middleware/auth.js";

const router = Router();

// Public/Optional-auth routes for viewing/filtering
router.get("/", getCustomers);
router.get("/export/csv", exportCSV);
router.post("/reset-seed", resetSeed);
router.get("/:id", getCustomerById);

// Customer Mutations (can be accessed with or without Bearer token; if token present, will validate permissions)
router.post("/", createCustomer);
router.put("/:id", updateCustomer);
router.delete("/:id", deleteCustomer);
router.post("/batch-delete", batchDeleteCustomers);
router.post("/batch-status", batchUpdateStatus);

export default router;
