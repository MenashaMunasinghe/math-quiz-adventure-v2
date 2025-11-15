import express from 'express';
import Question from '../models/Question.js';
import QuizAttempt from '../models/QuizAttempt.js';
import User from '../models/User.js';
import { requireAuth } from '../utils/auth.js';

const router = express.Router();

/**
 * GET /quiz/start?count=10&category=&difficulty=
 * Returns randomized questions without the correctIndex field.
 */
router.get('/start', async (req, res) => {
  try {
    const count = Math.min(parseInt(req.query.count || '10', 10), 50);
    const { category, difficulty } = req.query;

    const match = {};
    if (category) match.category = category;
    if (difficulty) match.difficulty = difficulty;

    const pipeline = [{ $match: match }, { $sample: { size: count } }];
    const docs = await Question.aggregate(pipeline);

    const sanitized = docs.map(q => ({
      id: q._id,
      text: q.text,
      options: q.options,
      category: q.category,
      difficulty: q.difficulty
    }));

    res.json({ questions: sanitized, count: sanitized.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /quiz/submit
 * Body: { answers: [{ questionId, selectedIndex }], durationSec }
 * Requires auth if you want to update leaderboard/highScore.
 */
router.post('/submit', requireAuth, async (req, res) => {
  try {
    const { answers = [], durationSec = 0 } = req.body;
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: 'answers array is required' });
    }

    // Load correct answers from DB
    const ids = answers.map(a => a.questionId);
    const questions = await Question.find({ _id: { $in: ids } }, { correctIndex: 1 }).lean();

    const correctById = new Map(questions.map(q => [q._id.toString(), q.correctIndex]));
    let score = 0;
    for (const a of answers) {
      const key = String(a.questionId);
      const correctIndex = correctById.get(key);
      if (typeof correctIndex === 'number' && a.selectedIndex === correctIndex) score += 1;
    }

    const total = answers.length;

    // Save attempt
    const attempt = await QuizAttempt.create({
      userId: req.user.uid,
      score,
      total,
      durationSec: Number(durationSec) || 0
    });

    // Update high score
    const user = await User.findById(req.user.uid);
    if (user) {
      if (score > (user.highScore || 0)) {
        user.highScore = score;
        await user.save();
      }
    }

    res.json({ score, total, accuracy: total ? score / total : 0, attemptId: attempt._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
