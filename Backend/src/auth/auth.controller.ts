import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import BattleHistory from '../models/history.model.js';
import config from '../config/config.js';

// ── Register ────────────────────────────────────────────────────────────────
export async function register(req: any, res: any) {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    // Check if user already exists
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
    });

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email, name: user.name },
      config.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        battleCount: user.battleCount,
        createdAt: user.createdAt,
      },
    });
  } catch (err: any) {
    console.error('[Auth/Register] Error:', err);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
}

// ── Login ────────────────────────────────────────────────────────────────────
export async function login(req: any, res: any) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email, name: user.name },
      config.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Logged in successfully!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        battleCount: user.battleCount,
        createdAt: user.createdAt,
      },
    });
  } catch (err: any) {
    console.error('[Auth/Login] Error:', err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
}

// ── Me (verify token) ────────────────────────────────────────────────────────
export async function me(req: any, res: any) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, config.JWT_SECRET);

    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ user });
  } catch (err: any) {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

// ── Get History ──────────────────────────────────────────────────────────────
export async function getHistory(req: any, res: any) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, config.JWT_SECRET);

    // Fetch history
    const history = await BattleHistory.find({ userId: decoded.userId })
      .sort({ createdAt: -1 });

    res.json({ history });
  } catch (err: any) {
    console.error('[Auth/History] Error:', err);
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

