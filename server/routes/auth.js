import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d'
  });
};

// Create log entry utility
const logActivity = async (userId, action, req) => {
  try {
    await ActivityLog.create({
      userId,
      action,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Unknown'
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

// @route   POST api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter all fields' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const verificationToken = Math.random().toString(36).substring(2, 15);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      verificationToken,
      isVerified: false // Users need to verify email
    });

    await logActivity(user._id, 'Registration Successful', req);

    console.log(`✉️ Verification token for ${email}: ${verificationToken}`);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please verify your email.',
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        kycStatus: user.kycStatus,
        balance: user.balance
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
  const { email, password, code2fa } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter all fields' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await logActivity(null, `Failed Login Attempt: ${email}`, req);
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    // 2FA check
    if (user.twoFactorEnabled) {
      if (!code2fa) {
        return res.status(200).json({
          success: true,
          require2FA: true,
          userId: user._id,
          message: 'Two-factor authentication code required'
        });
      }
      
      // Mock code verification (e.g. "123456" or matching secret)
      if (code2fa !== '123456' && code2fa !== user.twoFactorSecret) {
        await logActivity(user._id, '2FA Code Verification Failed', req);
        return res.status(400).json({ success: false, message: 'Invalid 2FA code' });
      }
    }

    await logActivity(user._id, 'Login Successful', req);

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        kycStatus: user.kycStatus,
        balance: user.balance,
        twoFactorEnabled: user.twoFactorEnabled,
        avatar: user.avatar,
        bankDetails: user.bankDetails
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST api/auth/google-login
// @desc    Authenticate user with Google credentials (mock logic)
router.post('/google-login', async (req, res) => {
  const { email, name, googleId, avatar } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      // Auto-register user with random password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(Math.random().toString(36), salt);
      
      user = await User.create({
        name,
        email,
        password: hashedPassword,
        isVerified: true, // Google accounts are auto-verified
        avatar: avatar || ''
      });
      await logActivity(user._id, 'Google Sign-Up & Login Successful', req);
    } else {
      // Just log them in
      if (avatar && !user.avatar) {
        await User.findByIdAndUpdate(user._id, { avatar });
      }
      await logActivity(user._id, 'Google Login Successful', req);
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        kycStatus: user.kycStatus,
        balance: user.balance,
        twoFactorEnabled: user.twoFactorEnabled,
        avatar: user.avatar || avatar,
        bankDetails: user.bankDetails
      }
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST api/auth/verify-email
// @desc    Verify email address
router.post('/verify-email', async (req, res) => {
  const { token } = req.body;

  try {
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification token' });
    }

    await User.findByIdAndUpdate(user._id, {
      isVerified: true,
      verificationToken: null
    });

    await logActivity(user._id, 'Email Verified', req);

    res.json({ success: true, message: 'Email verified successfully!' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST api/auth/forgot-password
// @desc    Request password reset link
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User with this email does not exist' });
    }

    const resetPasswordToken = Math.random().toString(36).substring(2, 15);
    const resetPasswordExpires = Date.now() + 3600000; // 1 hour from now

    await User.findByIdAndUpdate(user._id, {
      resetPasswordToken,
      resetPasswordExpires
    });

    console.log(`✉️ Reset link for ${email}: http://localhost:5173/reset-password/${resetPasswordToken}`);

    res.json({ success: true, message: 'Password reset link sent to your email (check server logs/console)' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST api/auth/reset-password
// @desc    Reset password
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null
    });

    await logActivity(user._id, 'Password Reset Successful', req);

    res.json({ success: true, message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET api/auth/me
// @desc    Get current user profile
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        kycStatus: user.kycStatus,
        balance: user.balance,
        twoFactorEnabled: user.twoFactorEnabled,
        avatar: user.avatar,
        bankDetails: user.bankDetails
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT api/auth/profile
// @desc    Update profile details
router.put('/profile', protect, async (req, res) => {
  const { name, bankDetails, newPassword, currentPassword, twoFactorEnabled, avatar } = req.body;

  try {
    const user = await User.findById(req.user._id);
    const updateData = {};

    if (name) updateData.name = name;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (twoFactorEnabled !== undefined) {
      updateData.twoFactorEnabled = twoFactorEnabled;
      if (twoFactorEnabled && !user.twoFactorSecret) {
        updateData.twoFactorSecret = '123456'; // Default mock secret
      }
    }
    if (bankDetails) {
      updateData.bankDetails = {
        bankName: bankDetails.bankName || user.bankDetails?.bankName || '',
        accountNumber: bankDetails.accountNumber || user.bankDetails?.accountNumber || '',
        ifscCode: bankDetails.ifscCode || user.bankDetails?.ifscCode || ''
      };
    }

    // Password change logic
    if (newPassword && currentPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect' });
      }
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(newPassword, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(user._id, updateData, { new: true });
    await logActivity(user._id, 'Profile Updated', req);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        isVerified: updatedUser.isVerified,
        kycStatus: updatedUser.kycStatus,
        balance: updatedUser.balance,
        twoFactorEnabled: updatedUser.twoFactorEnabled,
        avatar: updatedUser.avatar,
        bankDetails: updatedUser.bankDetails
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET api/auth/logs
// @desc    Get user security activity logs
router.get('/logs', protect, async (req, res) => {
  try {
    const logs = await ActivityLog.find({ userId: req.user._id });
    // Sort logs descending (latest first)
    logs.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
    res.json({ success: true, logs });
  } catch (error) {
    console.error('Activity logs fetch error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
