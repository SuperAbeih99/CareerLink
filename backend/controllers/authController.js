const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const connectDB = require("../config/db");

// Generate token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "60d" });
};

// @desc Register new user
exports.register = async (req, res) => {
  const ts = new Date().toISOString();
  console.log(`[AUTH][register] hit ${ts} body=`, req.body?.email);
  try {
    const withStep = (label, promise, ms = 4000) => {
      console.log(`[AUTH] ${label} start`);
      return Promise.race([
        promise,
        new Promise((_, rej) => setTimeout(() => rej(new Error(`${label} timed out after ${ms}ms`)), ms)),
      ]).then((r) => {
        console.log(`[AUTH] ${label} done`);
        return r;
      });
    };

    await withStep("connectDB", connectDB(), 4000);

    const { fullName, name, email, password, role } = req.body || {};
    const displayName = fullName || name;
    if (!displayName || !email || !password) {
      return res
        .status(400)
        .json({ ok: false, message: "name/fullName, email, password are required" });
    }

    const existing = await withStep("find existing", User.findOne({ email }).lean());
    if (existing) return res.status(409).json({ ok: false, message: "Email already registered" });

    const hash = await withStep("hash", bcrypt.hash(password, 8));
    const user = await withStep(
      "create user",
      User.create({ fullName: displayName, email, password: hash, role: role || "jobseeker" })
    );

    const token = generateToken(user._id);
    const safe = {
      id: user._id,
      fullName: user.fullName || user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    return res.status(201).json({ ok: true, user: safe, token });
  } catch (err) {
    console.error("[AUTH] register error:", err);
    return res.status(500).json({ ok: false, message: "Register failed", error: err.message });
  }
};

// @desc Login user
exports.login = async (req, res) => {
  const ts = new Date().toISOString();
  console.log(`[AUTH][login] hit ${ts} body=`, req.body?.email);
  try {
    const withStep = (label, promise, ms = 4000) => {
      console.log(`[AUTH] ${label} start`);
      return Promise.race([
        promise,
        new Promise((_, rej) => setTimeout(() => rej(new Error(`${label} timed out after ${ms}ms`)), ms)),
      ]).then((r) => {
        console.log(`[AUTH] ${label} done`);
        return r;
      });
    };

    await withStep("connectDB", connectDB(), 4000);

    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ ok: false, message: "email and password are required" });
    }

    const user = await withStep("find user", User.findOne({ email }));
    if (!user) return res.status(401).json({ ok: false, message: "Invalid credentials" });

    const ok = await withStep("compare", bcrypt.compare(password, user.password));
    if (!ok) return res.status(401).json({ ok: false, message: "Invalid credentials" });

    const token = generateToken(user._id);
    const safe = {
      id: user._id,
      fullName: user.fullName || user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    return res.json({ ok: true, user: safe, token });
  } catch (err) {
    console.error("[AUTH] login error:", err);
    return res.status(500).json({ ok: false, message: "Login failed", error: err.message });
  }
};

// @desc Get logged-in user
exports.getMe = async (req, res) => {
  res.json(req.user);
};
