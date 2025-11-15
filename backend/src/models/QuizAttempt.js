/**
 * QuizAttempt model: records each quiz submission.
 * Fields:
 *   - userId: reference to User who took the quiz (can be null for anonymous attempts)
 *   - score: number of questions answered correctly
 *   - total: total number of questions in the quiz
 *   - durationSec: time taken to complete the quiz (in seconds)
 *   - createdAt: timestamp when the attempt was submitted
 */

import mongoose from "mongoose";

const QuizAttemptSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    score: { type: Number, required: true },
    total: { type: Number, required: true },
    durationSec: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

export default mongoose.model("QuizAttempt", QuizAttemptSchema);
