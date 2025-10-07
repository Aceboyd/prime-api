import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import connectDB from "./db/index";
import authRouter from "./routes/auth";
import cors from "cors";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

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

// 📖 Swagger setup
const swaggerOptions = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Prime API",
      version: "1.0.0",
      description: "API for user authentication and management",
    },
    servers: [
      {
        url: process.env.API_URL || "https://prime-api-gm2o.onrender.com",
        description: "Production server",
      },
    ],
  },
  apis: ["./dist/routes/*.js"], // Path to files with JSDoc comments
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

const PORT: string | number = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));