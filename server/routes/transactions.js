import express from 'express';
import { Transaction } from '../models/Transaction.js';
import { User } from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET api/transactions
// @desc    Get transaction history with search, filters, pagination
router.get('/', protect, async (req, res) => {
  try {
    const { search, type, category, page = 1, limit = 10, sortBy = 'date', order = 'desc' } = req.query;

    const query = { userId: req.user._id.toString() };

    // Apply filters
    if (type) {
      query.type = type;
    }
    if (category) {
      query.category = category;
    }

    let transactions = await Transaction.find(query);

    // Apply in-memory search filter (since we support SQL/Mongoose fallback, simple filter is robust)
    if (search) {
      const searchLower = search.toLowerCase();
      transactions = transactions.filter(t => 
        (t.symbol && t.symbol.toLowerCase().includes(searchLower)) ||
        (t.category && t.category.toLowerCase().includes(searchLower)) ||
        (t.type && t.type.toLowerCase().includes(searchLower))
      );
    }

    // Sorting
    transactions.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];
      
      // Handle date type parsing if needed
      if (sortBy === 'date' || sortBy === 'createdAt') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }

      if (order === 'desc') {
        return valB > valA ? 1 : -1;
      } else {
        return valA > valB ? 1 : -1;
      }
    });

    // Pagination
    const totalTransactions = transactions.length;
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedTransactions = transactions.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedTransactions,
      pagination: {
        total: totalTransactions,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(totalTransactions / limit)
      }
    });
  } catch (error) {
    console.error('Fetch transactions error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST api/transactions/deposit
// @desc    Deposit cash into wallet
router.post('/deposit', protect, async (req, res) => {
  const { amount, bankName, accountNumber } = req.body;

  try {
    const numAmount = Number(amount);
    if (!amount || numAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Please enter a valid amount' });
    }

    const user = await User.findById(req.user._id);
    const newBalance = Number((user.balance + numAmount).toFixed(2));

    // Update wallet balance
    await User.findByIdAndUpdate(user._id, { balance: newBalance });

    // Create transaction log
    const transaction = await Transaction.create({
      userId: user._id,
      type: 'Deposit',
      category: 'Wallet',
      amount: numAmount,
      status: 'Completed',
      date: new Date()
    });

    res.json({
      success: true,
      message: `Successfully deposited $${numAmount.toLocaleString()} into your wallet`,
      balance: newBalance,
      transaction
    });
  } catch (error) {
    console.error('Deposit error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST api/transactions/withdraw
// @desc    Withdraw cash from wallet
router.post('/withdraw', protect, async (req, res) => {
  const { amount, bankName, accountNumber } = req.body;

  try {
    const numAmount = Number(amount);
    if (!amount || numAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Please enter a valid amount' });
    }

    const user = await User.findById(req.user._id);

    if (user.balance < numAmount) {
      return res.status(400).json({ success: false, message: 'Insufficient balance to withdraw' });
    }

    const newBalance = Number((user.balance - numAmount).toFixed(2));

    // Update wallet balance
    await User.findByIdAndUpdate(user._id, { balance: newBalance });

    // Create transaction log
    const transaction = await Transaction.create({
      userId: user._id,
      type: 'Withdraw',
      category: 'Wallet',
      amount: numAmount,
      status: 'Completed',
      date: new Date()
    });

    res.json({
      success: true,
      message: `Successfully withdrew $${numAmount.toLocaleString()} from your wallet`,
      balance: newBalance,
      transaction
    });
  } catch (error) {
    console.error('Withdrawal error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
