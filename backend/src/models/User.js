/**
 * User model: represents a registered quiz player.
 * Fields:
 *   - username: unique handle for the user
 *   - email: unique email address
 *   - passwordHash: bcrypted password (never stored plain text)
 *   - highScore: best quiz score achieved (for leaderboard)
 *   - createdAt: account creation timestamp
 */

import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    highScore: { type: Number, default: 0, index: true },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

export default mongoose.model("User", UserSchema);
