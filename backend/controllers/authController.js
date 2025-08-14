const User = require("../models/User");
const jwt = require("jsonwebtoken");
const connectDB = require("../config/db");

// Generate token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "60d" });
};

// @desc Register new user
exports.register = async (req, res) => {
  console.log("[AUTH] register route hit", req.body);
  try {
    // Ensure DB ready (cached, short timeouts configured)
    await connectDB();
    console.log("[AUTH] DB connected for register");

    const withTimeout = (p, ms, label = 'op') => Promise.race([
      p,
      new Promise((_, rej) => setTimeout(() => rej(new Error(`${label} timed out after ${ms}ms`)), ms))
    ]);

    const { name, email, password, avatar, role } = req.body;
    const userExists = await withTimeout(User.findOne({ email }), 2500, 'findOne');
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const user = await withTimeout(User.create({ name, email, password, role, avatar }), 3500, 'create');
    console.log("[AUTH] user created", user._id?.toString());

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      token: generateToken(user._id),
      companyName: user.companyName || '',
      companyDescription: user.companyDescription || '',
      companyLogo: user.companyLogo || '',
      resume: user.resume || '',
    });

  } catch (err) {
    console.error("[AUTH] register error:", err);
    res.status(500).json({ message: err.message });
  }
};

// @desc Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
      avatar: user.avatar || '',
      companyName: user.companyName || '',
      companyDescription: user.companyDescription || '',
      companyLogo: user.companyLogo || '',
      resume: user.resume || '',
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Get logged-in user
exports.getMe = async (req, res) => {
  res.json(req.user);
};
