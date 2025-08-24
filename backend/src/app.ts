import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import { errorHandler } from "./middlewares/errorHandler";
import { setLang } from "./middlewares/langMiddleware";

import authRoutes from "./routes/authRoutes";
import adminRoutes from "./routes/adminRoutes";
import userRoutes from "./routes/userRoutes";
import selfRoutes from "./routes/selfRoutes";
import requestRoutes from "./routes/requestRoutes";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Core middleware
app.use(morgan("dev"));
app.use(
  cors({
    origin: ["http://localhost:4200", "http://127.0.0.1:4200"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);
app.use(cookieParser());
app.use(express.json());

// Custom middleware
app.use(setLang);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/self", selfRoutes);
app.use("/api/requests", requestRoutes);

// Static files
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Health check
app.get("/", (req, res) => res.send("API is running..."));

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route non trouvée" });
});

app.use(errorHandler);

export default app;
