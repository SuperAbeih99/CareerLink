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

router.post('/register', async (req, res, next) => {
  try {
    await register(req, res);
  } catch (e) {
    next(e);
  }
})

router.post('/login', login)
router.get("/me", protect, getMe);

// Cloudinary upload returns req.file.path as the hosted URL
router.post('/upload-image', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  return res.status(200).json({ imageUrl: req.file.path });
});


module.exports = router;
