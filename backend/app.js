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

// 🔊 boot log
console.log("[BOOT] app.js loaded at", new Date().toISOString());

// CORS + JSON first (Render/Node server compatible)
const allowed = (process.env.CLIENT_URL || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowed.length === 0 || allowed.includes(origin))
        return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Request log for every invocation (helps trace timeouts)
app.use((req, res, next) => {
  try {
    console.log(
      `[REQ] ${req.method} ${req.url} at ${new Date().toISOString()}`
    );
  } catch (_) {}
  next();
});

// ✅ Health MUST be before any DB usage and return instantly
app.get("/health", (req, res) => {
  console.log(
    "[HEALTH] hit at",
    new Date().toISOString(),
    "region=",
    process.env.VERCEL_REGION
  );
  return res.status(200).json({ ok: true, ts: new Date().toISOString() });
});

// DB-free probe under /api to confirm Express/routing without touching Mongo
app.get("/api/ping", (req, res) => {
  return res.status(200).json({
    ok: true,
    where: "app.js /api/ping",
    ts: new Date().toISOString(),
  });
});

// DB reachability probe (no route handlers invoked beyond this)
app.get("/api/db-check", async (req, res) => {
  try {
    const withTimeout = (p, ms, label = "op") =>
      Promise.race([
        p,
        new Promise((_, rej) =>
          setTimeout(
            () => rej(new Error(`${label} timed out after ${ms}ms`)),
            ms
          )
        ),
      ]);
    await withTimeout(connectDB(), 4500, "Mongo connect");
    return res.status(200).json({ ok: true, msg: "Mongo reachable" });
  } catch (err) {
    return res.status(503).json({ ok: false, msg: err.message });
  }
});

function withTimeout(promise, ms, label = "op") {
  return Promise.race([
    promise,
    new Promise((_, rej) =>
      setTimeout(() => rej(new Error(`${label} timed out after ${ms}ms`)), ms)
    ),
  ]);
}

// 🛡️ Fast-fail DB connect for API paths only (still fine under Node server)
app.use(async (req, res, next) => {
  // allow /health and any non-API path to skip DB check
  if (req.path === "/health" || !req.path.startsWith("/api/")) return next();

  console.log(
    `[DB] connect attempt for ${req.method} ${
      req.path
    } at ${new Date().toISOString()}`
  );
  try {
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
