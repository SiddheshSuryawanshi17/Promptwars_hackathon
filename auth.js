const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'venueflow-secret-key-change-in-production';

// Simulate user storage (replace with MongoDB)
let users = {};

// Hash password
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

// Verify password
const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Middleware to verify token
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  req.userId = decoded.userId;
  next();
};

// Register user
const registerUser = async (email, password, name) => {
  if (users[email]) {
    return { error: 'User already exists' };
  }

  const hashedPassword = await hashPassword(password);
  users[email] = {
    email,
    password: hashedPassword,
    name,
    createdAt: new Date(),
    points: 0,
    role: 'user'
  };

  const token = generateToken(email);
  return {
    token,
    user: { email, name, points: 0, role: 'user' }
  };
};

// Login user
const loginUser = async (email, password) => {
  const user = users[email];

  if (!user) {
    return { error: 'User not found' };
  }

  const validPassword = await verifyPassword(password, user.password);
  if (!validPassword) {
    return { error: 'Invalid password' };
  }

  const token = generateToken(email);
  return {
    token,
    user: { email, name: user.name, points: user.points, role: user.role }
  };
};

// Get user by ID
const getUser = (userId) => {
  return users[userId];
};

module.exports = {
  registerUser,
  loginUser,
  getUser,
  authMiddleware,
  verifyToken,
  generateToken,
  users
};
