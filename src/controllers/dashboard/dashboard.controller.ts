import { Request, Response, NextFunction } from "express";

import dashboardService from "../../services/dashboard/dashboard.service";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";

class DashboardController {
  /**
   * Get dashboard data.
   *
   * GET /api/v1/dashboard
   * GET /api/v1/dashboard?from=2026-09-01&to=2026-09-30
   */
  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthenticatedRequest).userId;

      // ================================================
      // 1. Authentication check
      // ================================================

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      // ================================================
      // 2. Read date filters
      // ================================================

      const fromParam =
        typeof req.query.from === "string" ? req.query.from : undefined;

      const toParam =
        typeof req.query.to === "string" ? req.query.to : undefined;

      let from: Date | undefined;
      let to: Date | undefined;

      // ================================================
      // 3. Validate From date
      // ================================================

      if (fromParam) {
        from = new Date(`${fromParam}T00:00:00.000Z`);

        if (Number.isNaN(from.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid from date",
          });
        }
      }

      // ================================================
      // 4. Validate To date
      // ================================================

      if (toParam) {
        to = new Date(`${toParam}T23:59:59.999Z`);

        if (Number.isNaN(to.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid to date",
          });
        }
      }

      // ================================================
      // 5. Validate date range
      // ================================================

      if (from && to && from > to) {
        return res.status(400).json({
          success: false,
          message: "From date cannot be after to date",
        });
      }

      // ================================================
      // 6. Get dashboard data
      // ================================================

      const dashboard = await dashboardService.getDashboard(userId, from, to);

      // ================================================
      // 7. Response
      // ================================================

      return res.status(200).json({
        success: true,
        data: dashboard,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new DashboardController();
