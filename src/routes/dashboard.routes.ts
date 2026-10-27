import dashboardController from "../controllers/dashboard/dashboard.controller";
import express from "express";
import authenticate from "../middleware/auth.middleware";

const dashboardRouter = express.Router();

dashboardRouter.get("/", authenticate, dashboardController.getDashboard);

export default dashboardRouter;
