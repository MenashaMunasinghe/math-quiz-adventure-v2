/**
 * Quiz routes: fetch random questions and submit quiz attempts.
 * Supports unauthenticated attempts (questions only) and authenticated submissions (with high score tracking).
 */

import express from "express";
import Question from "../models/Question.js";
import QuizAttempt from "../models/QuizAttempt.js";
import User from "../models/User.js";

const router = express.Router();

/**
 * GET /quiz/start?count=10&category=&difficulty=
 * Fetch random questions without revealing correct answers.
 * Query parameters:
 *   - count: number of questions (max 50, default 10)
 *   - category: filter by category (optional)
 *   - difficulty: filter by difficulty easy|medium|hard (optional)
 * Returns: { questions: [...], count }
 */
router.get("/start", async (req, res) => {
  try {
    // Validate and cap count parameter
    const count = Math.min(parseInt(req.query.count || "10", 10), 50);
    const { category, difficulty } = req.query;

    // Build MongoDB aggregation pipeline to fetch random questions
    const match = {};
    if (category) match.category = category;
    if (difficulty) match.difficulty = difficulty;

    const pipeline = [{ $match: match }, { $sample: { size: count } }];
    const docs = await Question.aggregate(pipeline);

    // Sanitize questions: return only public fields (exclude correctIndex)
    const sanitized = docs.map((q) => ({
      id: q._id,
      text: q.text,
      options: q.options,
      category: q.category,
      difficulty: q.difficulty,
    }));

    res.json({ questions: sanitized, count: sanitized.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /quiz/submit
 * Submit quiz answers for scoring. Optional authentication.
 * If authenticated, updates user's high score on leaderboard.
 * If anonymous, records attempt but does not update leaderboard.
 *
 * Body: {
 *   answers: [{ questionId, selectedIndex }, ...],
 *   durationSec: number
 * }
 *
 * Returns: { score, total, accuracy, attemptId }
 */
router.post("/submit", async (req, res) => {
  try {
    const { answers = [], durationSec = 0 } = req.body;

    // Validate answers array
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: "answers array is required" });
    }

    // Fetch question correct answers from database
    const ids = answers.map((a) => a.questionId);
    const questions = await Question.find(
      { _id: { $in: ids } },
      { correctIndex: 1 }
    ).lean();

    // Build map of questionId -> correctIndex for fast lookup
    const correctById = new Map(
      questions.map((q) => [q._id.toString(), q.correctIndex])
    );

    // Calculate score by comparing selected answers to correct answers
    let score = 0;
    for (const a of answers) {
      const key = String(a.questionId);
      const correctIndex = correctById.get(key);
      if (typeof correctIndex === "number" && a.selectedIndex === correctIndex)
        score += 1;
    }

    const total = answers.length;

    // Save quiz attempt to database (userId may be null for anonymous attempts)
    const userId = req.user && req.user.uid ? req.user.uid : null;
    const attempt = await QuizAttempt.create({
      userId,
      score,
      total,
      durationSec: Number(durationSec) || 0,
    });

    // Update user's high score if authenticated and score is higher
    if (userId) {
      const user = await User.findById(userId);
      if (user && score > (user.highScore || 0)) {
        user.highScore = score;
        await user.save();
      }
    }

    // Return scoring details
    res.json({
      score,
      total,
      accuracy: total ? score / total : 0,
      attemptId: attempt._id,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
