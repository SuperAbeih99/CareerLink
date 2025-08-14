require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const savedJobsRoutes = require("./routes/savedJobsRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

const app = express();

// CORS + JSON first
app.use(
  cors({
    origin: (origin, cb) => {
      const allowed = (process.env.CLIENT_URL || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (!origin) return cb(null, true);
      if (allowed.length === 0 || allowed.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Health should NOT touch Mongo (instant)
app.get("/health", (req, res) => {
  res.status(200).json({
    ok: true,
    ts: new Date().toISOString(),
    region: process.env.VERCEL_REGION || null,
  });
});

function withTimeout(promise, ms, label = "op") {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    ),
  ]);
}

// Ensure DB for API routes but fail FAST instead of hanging
app.use(async (req, res, next) => {
  if (req.path === "/health") return next();
  try {
    console.log(`[DB] connect attempt for ${req.method} ${req.path} at ${new Date().toISOString()}`);
    await withTimeout(connectDB(), 4500, "Mongo connect");
    return next();
  } catch (err) {
    console.error("[DB] connect error:", err.message);
    return res
      .status(503)
      .json({ message: "Database unavailable", error: err.message });
  }
});

// Routes mounted under /api/v1
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/jobs", jobRoutes);
app.use("/api/v1/applications", applicationRoutes);
app.use("/api/v1/save-jobs", savedJobsRoutes);
app.use("/api/v1/analytics", analyticsRoutes);

// Root info route
app.get("/", (req, res) => {
  res.json({
    ok: true,
    name: "CareerLink API",
    endpoints: ["/health", "/api/v1/*"],
    ts: new Date().toISOString(),
  });
});

// Basic error handler to avoid hanging responses
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const message = err?.message || "Internal Server Error";
  res.status(500).json({ error: message });
});

module.exports = app;
