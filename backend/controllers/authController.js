const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const COST = 8;

function withTimeout(promise, ms, label = "op") {
  return Promise.race([
    promise,
    new Promise((_, rej) =>
      setTimeout(() => rej(new Error(`${label} timed out after ${ms}ms`)), ms)
    ),
  ]);
}

exports.register = async (req, res) => {
  const t0 = Date.now();
  console.log("[AUTH] /register start");

  try {
    const { fullName, email, password, role } = req.body || {};
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    console.log("[AUTH] findOne");
    const existing = await withTimeout(
      User.findOne({ email }),
      4000,
      "findOne"
    );
    if (existing)
      return res.status(409).json({ message: "Email already registered" });

    console.log("[AUTH] hash");
    const hash = await withTimeout(
      bcrypt.hash(password, COST),
      4000,
      "bcrypt.hash"
    );

    console.log("[AUTH] create");
    const user = await withTimeout(
      User.create({
        fullName,
        email,
        password: hash,
        role: role || "jobseeker",
      }),
      4000,
      "User.create"
    );

    console.log("[AUTH] jwt");
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    console.log("[AUTH] ok", Date.now() - t0, "ms");
    return res.status(201).json({ id: user._id, user, token });
  } catch (err) {
    console.error("[AUTH] error", err.message);
    const isTimeout = /timed out/i.test(err.message);
    return res
      .status(isTimeout ? 503 : 500)
      .json({ message: "Error registering", error: err.message });
  }
};

exports.login = async (req, res) => {
  const t0 = Date.now();
  console.log("[AUTH] /login start");
  try {
    const { email, password } = req.body || {};
    if (!email || !password)
      return res.status(400).json({ message: "Missing fields" });

    console.log("[AUTH] findOne");
    const user = await withTimeout(User.findOne({ email }), 4000, "findOne");
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    console.log("[AUTH] compare");
    const ok = await withTimeout(
      bcrypt.compare(password, user.password),
      4000,
      "bcrypt.compare"
    );
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    console.log("[AUTH] jwt");
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    console.log("[AUTH] ok", Date.now() - t0, "ms");
    return res.status(200).json({ id: user._id, user, token });
  } catch (err) {
    console.error("[AUTH] error", err.message);
    const isTimeout = /timed out/i.test(err.message);
    return res
      .status(isTimeout ? 503 : 500)
      .json({ message: "Error logging in", error: err.message });
  }
};

// @desc Get logged-in user
exports.getMe = async (req, res) => {
  res.json(req.user);
};
