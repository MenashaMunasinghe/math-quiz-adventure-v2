import express from 'express';
import User from '../models/User.js';
import QuizAttempt from '../models/QuizAttempt.js';
import { requireAuth } from '../utils/auth.js';

const router = express.Router();

// GET /leaderboard/top?limit=20
router.get('/top', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '20', 10), 100);
    const top = await User.find({}, { username: 1, highScore: 1 })
      .sort({ highScore: -1, _id: 1 })
      .limit(limit)
      .lean();
    res.json({ top });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /leaderboard/me
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.uid, { username: 1, email: 1, highScore: 1 }).lean();
    if (!user) return res.status(404).json({ error: 'User not found' });
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
