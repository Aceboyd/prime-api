import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import connectDB from "./db/index";
import authRouter from "./routes/auth";
import adminRouter from "./routes/adminRoutes"; // Import admin routes
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

// 🛤️ Mount routes
app.use("/auth", authRouter);
app.use("/admin", adminRouter); // Mount admin routes

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
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./dist/routes/*.js"], // Adjust if needed for TypeScript
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

const PORT: string | number = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));