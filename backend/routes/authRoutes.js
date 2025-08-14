const express = require("express");
const { register, login, getMe } = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const upload = require('../middlewares/uploadMiddleware')

const router = express.Router();

// Dummy fast route to isolate hangs (toggle as needed)
// router.post('/register', (req, res) => res.status(200).json({ ok: true, msg: 'Dummy register works' }));

// TEMP: uncomment this to isolate DB/bcrypt issues. Comment back after testing.
// router.post('/register', (req, res) => res.status(200).json({ ok: true, msg: 'Dummy register works' }));

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);

// Cloudinary upload returns req.file.path as the hosted URL
router.post('/upload-image', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  return res.status(200).json({ imageUrl: req.file.path });
});


module.exports = router;
