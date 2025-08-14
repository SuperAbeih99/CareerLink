const express = require("express");
const { register, login, getMe } = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const upload = require('../middlewares/uploadMiddleware')
const connectDB = require('../config/db')
const bcrypt = require('bcryptjs')
const User = require('../models/User')

const router = express.Router();

// Dummy fast route to isolate hangs (toggle as needed)
// QUICK ISOLATION: Uncomment to bypass DB/bcrypt and verify routing
// router.post('/register', (req, res) => res.status(200).json({ ok: true, msg: 'Dummy register works' }));
// For immediate test, enable dummy route (comment the real one below)
// router.post('/register', (req, res) => res.status(200).json({ ok: true, msg: 'Dummy register works' }));

// TEMP: uncomment this to isolate DB/bcrypt issues. Comment back after testing.
// router.post('/register', (req, res) => res.status(200).json({ ok: true, msg: 'Dummy register works' }));

// Temporary inline register to maximize logging surface
router.post('/register', async (req, res) => {
  console.log('[AUTH] inline register hit', req.body?.email)
  try {
    await connectDB();
    console.log('[AUTH] inline DB connected')
    const rounds = parseInt(process.env.BCRYPT_ROUNDS || '6', 10)
    const hashed = await bcrypt.hash(req.body.password, rounds)
    console.log('[AUTH] inline password hashed')
    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: hashed,
      role: req.body.role,
      avatar: req.body.avatar || ''
    })
    console.log('[AUTH] inline user created', user._id?.toString())
    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    })
  } catch (err) {
    console.error('[AUTH] inline register error:', err?.message || err)
    return res.status(500).json({ ok: false, error: String(err?.message || err) })
  }
})
router.post("/login", login);
router.get("/me", protect, getMe);

// Cloudinary upload returns req.file.path as the hosted URL
router.post('/upload-image', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  return res.status(200).json({ imageUrl: req.file.path });
});


module.exports = router;
