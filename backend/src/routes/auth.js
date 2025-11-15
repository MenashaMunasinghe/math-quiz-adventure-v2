/**
 * Authentication routes: user registration and login.
 * Handles password hashing, user creation, and JWT token generation.
 */

import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { signToken } from "../utils/auth.js";

const router = express.Router();

/**
 * POST /auth/register
 * Create a new user account.
 * Body: { username, email, password }
 * Returns: { token, user: { id, username, email, highScore } }
 */
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ error: "username, email, password are required" });
    }

    // Check if user already exists by email or username
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing)
      return res
        .status(409)
        .json({ error: "User already exists (email or username)" });

    // Hash password using bcrypt (10 salt rounds)
    const passwordHash = await bcrypt.hash(password, 10);

    // Create new user in database
    const user = await User.create({ username, email, passwordHash });

    // Generate JWT token
    const token = signToken({
      uid: user._id.toString(),
      username: user.username,
    });

    // Return token and user info
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        highScore: user.highScore,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /auth/login
 * Authenticate user with email and password.
 * Body: { email, password }
 * Returns: { token, user: { id, username, email, highScore } }
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password)
      return res.status(400).json({ error: "email and password are required" });

    // Find user by email
    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ error: "Invalid email or password" });

    // Compare provided password with stored hash
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok)
      return res.status(401).json({ error: "Invalid email or password" });

    // Generate JWT token
    const token = signToken({
      uid: user._id.toString(),
      username: user.username,
    });

    // Return token and user info
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        highScore: user.highScore,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
