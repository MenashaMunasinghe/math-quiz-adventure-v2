/**
 * Leaderboard routes: fetch top players and user profile with recent attempts.
 */

import express from "express";
import User from "../models/User.js";
import QuizAttempt from "../models/QuizAttempt.js";
import { requireAuth } from "../utils/auth.js";

const router = express.Router();

/**
 * GET /leaderboard/top?limit=20
 * Fetch top users ranked by highest score.
 * Query parameters:
 *   - limit: max results (max 100, default 20)
 * Returns: { top: [{ username, highScore }, ...] }
 */
router.get("/top", async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || "20", 10), 100);

    // Fetch top users sorted by high score descending, then by ID for tie-breaking
    const top = await User.find({}, { username: 1, highScore: 1 })
      .sort({ highScore: -1, _id: 1 })
      .limit(limit)
      .lean();

    res.json({ top });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /leaderboard/me
 * Fetch authenticated user's profile and recent quiz attempts.
 * Requires valid JWT token.
 * Returns: { user: { username, email, highScore }, recentAttempts: [...] }
 */
router.get("/me", requireAuth, async (req, res) => {
  try {
    // Fetch user profile
    const user = await User.findById(req.user.uid, {
      username: 1,
      email: 1,
      highScore: 1,
    }).lean();
    if (!user) return res.status(404).json({ error: "User not found" });

    // Fetch user's 10 most recent quiz attempts
    const attempts = await QuizAttempt.find({ userId: req.user.uid })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    res.json({ user, recentAttempts: attempts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
