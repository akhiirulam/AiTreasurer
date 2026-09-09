import { Router } from "express";

import authenticate from "../middleware/auth.middleware";
import authorize from "../middleware/authorize.middleware";

import {
  getAdminDashboard,
  getAllUsers,
  getUserById,
  updateUserStatus,
} from "../controllers/admin/admin.controller";

const router = Router();

// =====================================================
// ADMIN DASHBOARD
// =====================================================

router.get("/dashboard", authenticate, authorize("admin"), getAdminDashboard);

// =====================================================
// USER MANAGEMENT
// =====================================================

router.get("/users", authenticate, authorize("admin"), getAllUsers);

router.get("/users/:userId", authenticate, authorize("admin"), getUserById);

router.patch(
  "/users/:userId/status",
  authenticate,
  authorize("admin"),
  updateUserStatus,
);

export default router;
