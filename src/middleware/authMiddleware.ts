import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// 🛠️ Extend Request interface for TypeScript
export interface CustomRequest extends Request {
  user?: { id: string; email: string; role: string };
}

const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey123";

// 🔒 Authentication middleware
export const authMiddleware = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token", error: (error as Error).message });
  }
};