const connectDB = require("../../../../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../../../models/User");

module.exports = async (req, res) => {
  if (req.method !== "POST")
    return res.status(405).json({ message: "Method Not Allowed" });
  try {
    // CORS (optional – if you still enforce here)
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,DELETE,OPTIONS"
    );
    if (req.method === "OPTIONS") return res.status(204).end();

    const body = req.body || {};
    const { fullName, email, password, role } = body;
    if (!fullName || !email || !password)
      return res.status(400).json({ message: "Missing fields" });

    // connect fast (your db.js already has short timeouts + caching)
    await connectDB();

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ message: "Email already registered" });

    const hash = await bcrypt.hash(password, 8);
    const user = await User.create({
      fullName,
      email,
      password: hash,
      role: role || "jobseeker",
    });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return res.status(201).json({ id: user._id, user, token });
  } catch (err) {
    return res
      .status(/timed out/i.test(err.message) ? 503 : 500)
      .json({ message: "Error registering", error: err.message });
  }
};
