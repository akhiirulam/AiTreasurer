import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest<
  Params = Record<string, string>,
  ResBody = any,
  ReqBody = any,
> extends Request<Params, any, ReqBody> {
  userId?: string;
}

interface AccessTokenPayload {
  id: string;
}

const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    // ==========================================
    // 1. GET AUTHORIZATION HEADER
    // ==========================================

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Access token required",
      });
    }

    // ==========================================
    // 2. EXTRACT BEARER TOKEN
    // ==========================================

    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization header",
      });
    }

    const token = parts[1];

    // ==========================================
    // 3. VERIFY ACCESS TOKEN
    // ==========================================

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as AccessTokenPayload;

    // ==========================================
    // 4. CHECK USER ID
    // ==========================================

    if (!decoded.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid access token",
      });
    }

    // ==========================================
    // 5. ATTACH USER ID TO REQUEST
    // ==========================================

    req.userId = decoded.id;

    // ==========================================
    // 6. CONTINUE
    // ==========================================

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired access token",
    });
  }
};

export default authenticate;
