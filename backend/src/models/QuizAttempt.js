import mongoose from 'mongoose';

const QuizAttemptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  score: { type: Number, required: true },
  total: { type: Number, required: true },
  durationSec: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
}, { versionKey: false });

export default mongoose.model('QuizAttempt', QuizAttemptSchema);
