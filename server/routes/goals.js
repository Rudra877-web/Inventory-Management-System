import express from 'express';
import { Goal } from '../models/Goal.js';
import { User } from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET api/goals
// @desc    Get user's financial goals
router.get('/', protect, async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user._id.toString() });
    res.json({ success: true, data: goals });
  } catch (error) {
    console.error('Fetch goals error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST api/goals/create
// @desc    Create a new financial goal
router.post('/create', protect, async (req, res) => {
  const { name, targetAmount, deadline, currentAmount = 0 } = req.body;

  try {
    if (!name || !targetAmount || !deadline) {
      return res.status(400).json({ success: false, message: 'Please enter all required fields' });
    }

    const goal = await Goal.create({
      userId: req.user._id.toString(),
      name,
      targetAmount: Number(targetAmount),
      currentAmount: Number(currentAmount),
      deadline: new Date(deadline),
      status: 'Active'
    });

    res.status(201).json({ success: true, message: 'Goal created successfully', data: goal });
  } catch (error) {
    console.error('Create goal error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT api/goals/update/:id
// @desc    Update an existing financial goal
router.put('/update/:id', protect, async (req, res) => {
  const { name, targetAmount, deadline, currentAmount, status } = req.body;

  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal || goal.userId !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    const updateFields = {};
    if (name) updateFields.name = name;
    if (targetAmount !== undefined) updateFields.targetAmount = Number(targetAmount);
    if (deadline) updateFields.deadline = new Date(deadline);
    if (currentAmount !== undefined) updateFields.currentAmount = Number(currentAmount);
    
    if (status) {
      updateFields.status = status;
    } else if (currentAmount !== undefined || targetAmount !== undefined) {
      const checkCurrent = currentAmount !== undefined ? Number(currentAmount) : goal.currentAmount;
      const checkTarget = targetAmount !== undefined ? Number(targetAmount) : goal.targetAmount;
      updateFields.status = checkCurrent >= checkTarget ? 'Achieved' : 'Active';
    }

    const updatedGoal = await Goal.findByIdAndUpdate(req.params.id, updateFields, { new: true });

    res.json({ success: true, message: 'Goal updated successfully', data: updatedGoal });
  } catch (error) {
    console.error('Update goal error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST api/goals/allocate/:id
// @desc    Allocate cash from user wallet balance directly into a financial goal
router.post('/allocate/:id', protect, async (req, res) => {
  const { amount } = req.body;

  try {
    const numAmount = Number(amount);
    if (!amount || numAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Please specify a valid amount' });
    }

    const user = await User.findById(req.user._id);
    if (user.balance < numAmount) {
      return res.status(400).json({ success: false, message: 'Insufficient wallet balance' });
    }

    const goal = await Goal.findById(req.params.id);
    if (!goal || goal.userId !== user._id.toString()) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    const nextCurrent = Number((goal.currentAmount + numAmount).toFixed(2));
    const nextStatus = nextCurrent >= goal.targetAmount ? 'Achieved' : 'Active';

    // Deduct cash from wallet
    const nextWallet = Number((user.balance - numAmount).toFixed(2));
    await User.findByIdAndUpdate(user._id, { balance: nextWallet });

    // Update goal
    const updatedGoal = await Goal.findByIdAndUpdate(goal._id, {
      currentAmount: nextCurrent,
      status: nextStatus
    }, { new: true });

    res.json({
      success: true,
      message: `Allocated $${numAmount.toLocaleString()} to ${goal.name}`,
      walletBalance: nextWallet,
      data: updatedGoal
    });
  } catch (error) {
    console.error('Allocate to goal error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE api/goals/delete/:id
// @desc    Delete a financial goal
router.delete('/delete/:id', protect, async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal || goal.userId !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    await Goal.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Goal removed successfully' });
  } catch (error) {
    console.error('Delete goal error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
