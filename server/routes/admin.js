import express from 'express';
import { User } from '../models/User.js';
import { KYC } from '../models/KYC.js';
import { Transaction } from '../models/Transaction.js';
import { Investment } from '../models/Investment.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Apply auth & admin middlewares to all admin routes
router.use(protect);
router.use(admin);

// @route   GET api/admin/dashboard
// @desc    Get admin analytics overview
router.get('/dashboard', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const pendingKyc = await User.countDocuments({ kycStatus: 'Pending' });
    
    // Aggregating total investments manually to ensure compatibility with Mock DB
    const allInvestments = await Investment.find({});
    const totalInvestedValue = allInvestments.reduce((acc, inv) => acc + (inv.shares * inv.buyPrice), 0);

    const allTransactions = await Transaction.find({});
    const totalDeposited = allTransactions
      .filter(t => t.type === 'Deposit')
      .reduce((acc, t) => acc + t.amount, 0);

    res.json({
      success: true,
      data: {
        totalUsers,
        pendingKyc,
        totalInvestedValue: Number(totalInvestedValue.toFixed(2)),
        totalDeposited: Number(totalDeposited.toFixed(2)),
        transactionCount: allTransactions.length
      }
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET api/admin/users
// @desc    Get list of all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({});
    res.json({
      success: true,
      data: users.map(u => ({
        _id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        isVerified: u.isVerified,
        kycStatus: u.kycStatus,
        balance: u.balance,
        createdAt: u.createdAt
      }))
    });
  } catch (error) {
    console.error('Admin fetch users error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT api/admin/users/balance/:id
// @desc    Manually update a user's wallet balance (e.g. adjust virtual cash)
router.put('/users/balance/:id', async (req, res) => {
  const { balance } = req.body;
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const updated = await User.findByIdAndUpdate(user._id, { balance: Number(balance) }, { new: true });
    res.json({
      success: true,
      message: `Updated wallet balance for ${user.name} to $${Number(balance).toLocaleString()}`,
      data: updated
    });
  } catch (error) {
    console.error('Admin update user balance error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET api/admin/kyc
// @desc    Get all KYC applications
router.get('/kyc', async (req, res) => {
  try {
    const kycList = await KYC.find({});
    const users = await User.find({});

    // Associate user details with KYC forms
    const fullKycList = kycList.map(form => {
      const user = users.find(u => u._id.toString() === form.userId);
      return {
        ...form,
        userName: user ? user.name : 'Unknown User',
        userEmail: user ? user.email : 'Unknown Email'
      };
    });

    res.json({ success: true, data: fullKycList });
  } catch (error) {
    console.error('Admin fetch KYC applications error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT api/admin/kyc/approve/:id
// @desc    Approve a KYC application
router.put('/kyc/approve/:id', async (req, res) => {
  try {
    const form = await KYC.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ success: false, message: 'KYC application not found' });
    }

    // Update KYC document
    await KYC.findByIdAndUpdate(form._id, { status: 'Approved', remarks: 'Approved by administrator' });
    // Update User profile
    await User.findByIdAndUpdate(form.userId, { kycStatus: 'Approved' });

    res.json({ success: true, message: 'KYC application approved successfully' });
  } catch (error) {
    console.error('Admin approve KYC error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT api/admin/kyc/reject/:id
// @desc    Reject a KYC application
router.put('/kyc/reject/:id', async (req, res) => {
  const { remarks } = req.body;
  try {
    if (!remarks) {
      return res.status(400).json({ success: false, message: 'Please provide rejection remarks' });
    }

    const form = await KYC.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ success: false, message: 'KYC application not found' });
    }

    // Update KYC document
    await KYC.findByIdAndUpdate(form._id, { status: 'Rejected', remarks });
    // Update User profile
    await User.findByIdAndUpdate(form.userId, { kycStatus: 'Rejected' });

    res.json({ success: true, message: 'KYC application rejected' });
  } catch (error) {
    console.error('Admin reject KYC error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET api/admin/transactions
// @desc    Monitor all transactions in the system
router.get('/transactions', async (req, res) => {
  try {
    const transactions = await Transaction.find({});
    const users = await User.find({});

    const formatted = transactions.map(t => {
      const u = users.find(user => user._id.toString() === t.userId);
      return {
        ...t,
        userName: u ? u.name : 'Unknown User',
        userEmail: u ? u.email : 'Unknown Email'
      };
    });

    // Sort descending (latest first)
    formatted.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));

    res.json({ success: true, data: formatted });
  } catch (error) {
    console.error('Admin fetch transactions error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET api/admin/logs
// @desc    Get all security activity logs
router.get('/logs', async (req, res) => {
  try {
    const logs = await ActivityLog.find({});
    const users = await User.find({});

    const formatted = logs.map(l => {
      const u = l.userId ? users.find(user => user._id.toString() === l.userId) : null;
      return {
        ...l,
        userName: u ? u.name : 'System/Guest',
        userEmail: u ? u.email : 'Guest'
      };
    });

    // Sort descending (latest first)
    formatted.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));

    res.json({ success: true, data: formatted });
  } catch (error) {
    console.error('Admin fetch logs error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
