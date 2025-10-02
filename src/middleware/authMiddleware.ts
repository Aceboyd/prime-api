import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

// 🛠️ Extend Request interface
export interface CustomRequest extends Request {
  user?: { id: string; email: string; role: string };
}

const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey123";

// 🔒 Authentication middleware
export const authMiddleware = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1]; // safer extraction
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload & {
      id: string;
      email: string;
      role: string;
    };

    req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
      error: (error as Error).message,
    });
  }
};
