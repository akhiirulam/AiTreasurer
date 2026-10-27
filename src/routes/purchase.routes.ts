import express from "express";

import authenticate from "../middleware/auth.middleware";

import purchaseController from "../controllers/purchase/purchase.controller";

const purchaseRouter = express.Router();

// =====================================================
// PURCHASE ROUTES
// =====================================================

purchaseRouter.get("/", authenticate, purchaseController.getPurchases);

export default purchaseRouter;
