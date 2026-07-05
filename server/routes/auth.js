const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { pool } = require("../db");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const fallbackUsers = new Map();

async function findUserByEmail(email) {
  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    return result.rows[0] || null;
  } catch (err) {
    console.warn("[auth] DB lookup failed, using in-memory fallback:", err.message);
    return fallbackUsers.get(email.toLowerCase()) || null;
  }
}

async function createUserRecord(email, passwordHash, name) {
  try {
    const result = await pool.query(
      "INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name",
      [email, passwordHash, name || email.split("@")[0]]
    );
    return result.rows[0];
  } catch (err) {
    console.warn("[auth] DB insert failed, using in-memory fallback:", err.message);
    const user = { id: fallbackUsers.size + 1, email, name: name || email.split("@")[0] };
    fallbackUsers.set(email.toLowerCase(), { ...user, password_hash: passwordHash });
    return user;
  }
}

// Guest login -> no email needed, limited features, works instantly.
router.post("/guest", (req, res) => {
  const guestId = "guest_" + crypto.randomBytes(8).toString("hex");
  const token = jwt.sign({ type: "guest", guestId }, JWT_SECRET, {
    expiresIn: "7d",
  });
  res.json({
    token,
    user: { type: "guest", guestId, name: "Guest", features: "limited" },
  });
});

// Signup with email -> unlocks full features (voice input, resume correction, company match).
router.post("/signup", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUserRecord(email, passwordHash, name);
    const token = jwt.sign({ type: "user", userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "30d",
    });

    res.json({
      token,
      user: { type: "user", id: user.id, email: user.email, name: user.name, features: "full" },
    });
  } catch (err) {
    console.error("[auth/signup]", err.message);
    res.status(500).json({ error: "Signup failed. Please try again." });
  }
});

// Login with email
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ type: "user", userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "30d",
    });

    res.json({
      token,
      user: { type: "user", id: user.id, email: user.email, name: user.name, features: "full" },
    });
  } catch (err) {
    console.error("[auth/login]", err.message);
    res.status(500).json({ error: "Login failed. Please try again." });
  }
});

// Middleware other routes can use to check auth + feature access
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    req.auth = null;
    return next();
  }
  try {
    const token = authHeader.replace("Bearer ", "");
    const decoded = jwt.verify(token, JWT_SECRET);
    req.auth = decoded;
  } catch (err) {
    req.auth = null;
  }
  next();
}

module.exports = { router, verifyToken };
