/**
 * Main Express server entry point for the Math Quiz API.
 * Connects to MongoDB, sets up middleware, and registers routes.
 */

import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import mongoose from "mongoose";

import authRoutes from "./src/routes/auth.js";
import quizRoutes from "./src/routes/quiz.js";
import leaderboardRoutes from "./src/routes/leaderboard.js";

// Load environment variables from .env file
dotenv.config();
const app = express();

// ============ Middleware ============

// Enable CORS to allow frontend (on different port) to communicate with this API
app.use(cors());

// Parse incoming JSON requests (limit to 1MB to prevent large payloads)
app.use(express.json({ limit: "1mb" }));

// Log HTTP requests in dev format (method, path, status, response time)
app.use(morgan("dev"));

// ============ Configuration ============

const PORT = process.env.PORT || 8081;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/space_quiz_db";

// ============ Database Connection ============

/**
 * Connect to MongoDB. Exit process if connection fails.
 */
mongoose
  .connect(MONGO_URI, { autoIndex: true })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connect error:", err.message);
    process.exit(1);
  });

// ============ Routes ============

// Health check endpoint
app.get("/", (req, res) =>
  res.json({ ok: true, service: "space-quiz-backend" })
);

// API routes
app.use("/auth", authRoutes); // POST /auth/login, /auth/register
app.use("/quiz", quizRoutes); // GET /quiz/start, POST /quiz/submit
app.use("/leaderboard", leaderboardRoutes); // GET /leaderboard/top, /leaderboard/me

// ============ Error Handling ============

// Catch-all for 404 Not Found
app.use((req, res) => res.status(404).json({ error: "Not found" }));

// ============ Start Server ============

app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
