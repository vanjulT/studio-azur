const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/AppError");

function createToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );
}

function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email, role: user.role };
}

async function register(req, res) {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError("An account with this email already exists", 409);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashedPassword });

  res.status(201).json({ token: createToken(user), user: publicUser(user) });
}

async function login(req, res) {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  const passwordOk = user && (await bcrypt.compare(password, user.password));

  if (!passwordOk) {
    throw new AppError("Invalid email or password", 401);
  }

  res.status(200).json({ token: createToken(user), user: publicUser(user) });
}

async function getMe(req, res) {
  res.status(200).json({ user: publicUser(req.user) });
}

module.exports = { register, login, getMe };