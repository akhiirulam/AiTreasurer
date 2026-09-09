import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";

interface AccessTokenPayload extends JwtPayload {
  id: string;
  role: string;
}

interface RefreshTokenPayload extends JwtPayload {
  id: string;
  role: string;
}

// =====================================================
// ACCESS TOKEN
// =====================================================

export const generateAccessToken = (userId: string, role: string): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(
    {
      id: userId,
      role,
    },
    secret,
    {
      expiresIn: "15m",
    } as SignOptions,
  );
};

// =====================================================
// REFRESH TOKEN
// =====================================================

export const generateRefreshToken = (userId: string, role: string): string => {
  const secret = process.env.JWT_REFRESH_SECRET;

  if (!secret) {
    throw new Error("JWT_REFRESH_SECRET is not configured");
  }

  return jwt.sign(
    {
      id: userId,
      role,
    },
    secret,
    {
      expiresIn: "7d",
    } as SignOptions,
  );
};

// =====================================================
// VERIFY ACCESS TOKEN
// =====================================================

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  const decoded = jwt.verify(token, secret) as AccessTokenPayload;

  if (!decoded.id || !decoded.role) {
    throw new Error("Invalid access token payload");
  }

  return decoded;
};

// =====================================================
// VERIFY REFRESH TOKEN
// =====================================================

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  const secret = process.env.JWT_REFRESH_SECRET;

  if (!secret) {
    throw new Error("JWT_REFRESH_SECRET is not configured");
  }

  const decoded = jwt.verify(token, secret) as RefreshTokenPayload;

  if (!decoded.id || !decoded.role) {
    throw new Error("Invalid refresh token payload");
  }

  return decoded;
};
