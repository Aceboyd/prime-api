import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import connectDB from "./db/index";
import authRouter from "./routes/auth";
import adminRouter from "./routes/adminRoutes";
import cors from "cors";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

dotenv.config();

// 🗄️ Connect to MongoDB
connectDB();

const app: Express = express();

// 📦 Enable CORS with multiple origins
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  "https://primecrypto.netlify.app",             // your frontend (Netlify)
  "https://prime-api-gm2o.onrender.com",         // your backend (Render, for Swagger)
];

app.use(
  cors({
    origin: (origin, callback) => {
      // ✅ Allow requests with no origin (like Swagger or Postman)
      if (!origin) return callback(null, true);

      // ✅ Allow listed origins
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("🚫 CORS blocked origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);


app.use(express.json());

// 🛤️ Mount routes
app.use("/auth", authRouter);
app.use("/admin", adminRouter);

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
  apis: ["./dist/routes/*.js"],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

const PORT: string | number = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));