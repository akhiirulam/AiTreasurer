import jwt from "jsonwebtoken";

export const generateAccessToken = (userId: string) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET as string, {
    expiresIn: "15m",
  });
  return token;
};

export const generateRefreshToken = (userId: string) => {
  const token = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET as string,
    { expiresIn: "7d" },
  );
  return token;
};
