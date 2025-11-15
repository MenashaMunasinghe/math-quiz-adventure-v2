import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import authRoutes from './src/routes/auth.js';
import quizRoutes from './src/routes/quiz.js';
import leaderboardRoutes from './src/routes/leaderboard.js';

dotenv.config();
const app = express();

// Basic middleware
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

const PORT = process.env.PORT || 8081;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/space_quiz_db';

// DB connect
mongoose.connect(MONGO_URI, { autoIndex: true })
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => {
    console.error('❌ MongoDB connect error:', err.message);
    process.exit(1);
  });

// Routes
app.get('/', (req, res) => res.json({ ok: true, service: 'space-quiz-backend' }));
app.use('/auth', authRoutes);
app.use('/quiz', quizRoutes);
app.use('/leaderboard', leaderboardRoutes);

// 404
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
