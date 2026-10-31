const express = require("express");
const { rateLimit } = require("express-rate-limit");
const validate = require("../middleware/validate");
const { protect } = require("../middleware/auth");
const { registerSchema, loginSchema } = require("../validators/authSchemas");
const { register, login, getMe } = require("../controllers/authController");

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many attempts, please try again in 15 minutes" },
});

router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/login", authLimiter, validate(loginSchema), login);
router.get("/me", protect, getMe);

module.exports = router;