import express from "express";
import reportsController from "../controllers/reports/reports.controller";
import authenticate from "../middleware/auth.middleware";

const reportRouter = express.Router();

reportRouter.get("/", authenticate, reportsController.getReport);

export default reportRouter;
