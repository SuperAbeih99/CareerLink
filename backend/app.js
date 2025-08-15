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

// Consistent paths for both local and Vercel
const API_PREFIX = "/api/v1";
const BASE_PREFIX = "/api";

// 🔊 boot log
console.log("[BOOT] app.js loaded at", new Date().toISOString());

// Log every request with timestamps (helps spot where it hangs)
app.use((req, res, next) => {
  console.log(
    `[REQ] ${new Date().toISOString()} ${req.method} ${req.originalUrl}`
  );
  next();
});

// CORS + JSON first
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
app.use(express.json({ limit: "1mb" }));
app.options("*", (req, res) => res.sendStatus(204));

// (request logger defined earlier)

// Watchdog: fail fast if nothing responded within ~7.5s
app.use((req, res, next) => {
  const watchdog = setTimeout(() => {
    if (!res.headersSent) {
      console.error(`[WD] timeout for ${req.method} ${req.url}`);
      res.status(503).json({ ok: false, message: "Request watchdog timeout" });
    }
  }, 7500);
  res.on("finish", () => clearTimeout(watchdog));
  res.on("close", () => clearTimeout(watchdog));
  next();
});

// ✅ Health MUST be before any DB usage and return instantly
app.get(`${BASE_PREFIX}/health`, (req, res) => {
  console.log(
    "[HEALTH] hit at",
    new Date().toISOString(),
    "region=",
    process.env.VERCEL_REGION
  );
  return res.status(200).json({ ok: true, ts: new Date().toISOString() });
});

// DB-free probe
app.get(`${BASE_PREFIX}/ping`, (req, res) => {
  return res.status(200).json({
    ok: true,
    where: `app.js ${BASE_PREFIX}/ping`,
    ts: new Date().toISOString(),
  });
});

// Echo route: should respond instantly to POST with JSON
app.post(`${BASE_PREFIX}/echo`, (req, res) => {
  return res
    .status(200)
    .json({ ok: true, echo: req.body || null, ts: new Date().toISOString() });
});

// DB check: proves we can reach Atlas without touching auth logic
app.get(`${BASE_PREFIX}/db-check`, async (req, res) => {
  try {
    await connectDB();
    return res.status(200).json({ ok: true, ts: new Date().toISOString() });
  } catch (e) {
    return res.status(503).json({ ok: false, error: e.message });
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

// 🛡️ Fast-fail DB connect for API paths only
app.use(async (req, res, next) => {
  // allow /health and any non-versioned path to skip DB check
  // Versioned API paths begin with /api/v1
  if (
    req.path === `${BASE_PREFIX}/health`.replace(/^\/*/, "/") ||
    !req.path.startsWith("/api/v1/")
  )
    return next();

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

// Routes mounted under API prefix
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/user`, userRoutes);
app.use(`${API_PREFIX}/jobs`, jobRoutes);
app.use(`${API_PREFIX}/applications`, applicationRoutes);
app.use(`${API_PREFIX}/save-jobs`, savedJobsRoutes);
app.use(`${API_PREFIX}/analytics`, analyticsRoutes);

// Root info route
app.get("/", (req, res) => {
  res.json({
    ok: true,
    name: "CareerLink API",
    endpoints: ["/api/health", `${API_PREFIX}/*`],
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
