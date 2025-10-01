import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import connectDB from "./db/index";
import authRouter from "./routes/auth";
import cors from "cors";

dotenv.config();

// 🗄️ Connect to MongoDB
connectDB();

const app: Express = express();

// 📦 Enable CORS with frontend URL from environment
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());

// 🛤️ Mount auth routes
app.use("/auth", authRouter);

// 🏠 Health check endpoint
app.get("/", (req: Request, res: Response) => {
  res.json({ ok: true, message: "API running 🚀" });
});

const PORT: string | number = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));