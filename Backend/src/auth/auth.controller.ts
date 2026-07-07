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

    user.avatar = '';
    await user.save();

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
        avatar: user.avatar,
        googleAvatar: user.googleAvatar,
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
        avatar: user.avatar,
        googleAvatar: user.googleAvatar,
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

// ── Update Avatar ────────────────────────────────────────────────────────────
export async function updateAvatar(req: any, res: any) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, config.JWT_SECRET);

    const { avatar } = req.body;
    if (!avatar) {
      return res.status(400).json({ error: 'Avatar URL or seed is required.' });
    }

    const user = await User.findByIdAndUpdate(
      decoded.userId,
      { avatar },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ user });
  } catch (err: any) {
    console.error('[Auth/UpdateAvatar] Error:', err);
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

// ── Google Login ─────────────────────────────────────────────────────────────
export async function googleLogin(req: any, res: any) {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ error: 'Credential is required.' });
    }

    // Call Google's verification API securely
    const ticket = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
    const payload = await ticket.json();

    if (!ticket.ok || !payload.email) {
      return res.status(400).json({ error: 'Invalid or expired Google token.' });
    }

    const email = payload.email.toLowerCase().trim();
    const name = payload.name || email.split('@')[0];
    const picture = payload.picture || '';

    // Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      // User exists, update Google profile image in both googleAvatar and active avatar (if empty/DiceBear)
      user.googleAvatar = picture;
      if (!user.avatar || user.avatar.includes('api.dicebear.com')) {
        user.avatar = picture;
      }
      await user.save();
    } else {
      // Create user
      // Generate a secure random password for OAuth account compatibility
      const randomPassword = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(randomPassword, saltRounds);

      user = await User.create({
        name,
        email,
        password: hashedPassword,
        googleAvatar: picture,
        avatar: picture || '',
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email, name: user.name },
      config.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Logged in with Google successfully!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        battleCount: user.battleCount,
        avatar: user.avatar,
        googleAvatar: user.googleAvatar,
        createdAt: user.createdAt,
      },
    });
  } catch (err: any) {
    console.error('[Auth/GoogleLogin] Error:', err);
    res.status(500).json({ error: 'Google login failed. Please try again.' });
  }
}


