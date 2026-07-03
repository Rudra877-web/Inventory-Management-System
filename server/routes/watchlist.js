import express from 'express';
import { Watchlist } from '../models/Watchlist.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET api/watchlist
// @desc    Get user's watchlist
router.get('/', protect, async (req, res) => {
  try {
    const list = await Watchlist.find({ userId: req.user._id.toString() });
    res.json({ success: true, data: list });
  } catch (error) {
    console.error('Fetch watchlist error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST api/watchlist/add
// @desc    Add asset to watchlist
router.post('/add', protect, async (req, res) => {
  const { symbol, name, category } = req.body;

  try {
    if (!symbol || !name || !category) {
      return res.status(400).json({ success: false, message: 'Missing fields' });
    }

    const upperSymbol = symbol.toUpperCase();

    // Check if already in watchlist
    const exists = await Watchlist.findOne({ userId: req.user._id.toString(), symbol: upperSymbol });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Asset already in watchlist' });
    }

    const item = await Watchlist.create({
      userId: req.user._id.toString(),
      symbol: upperSymbol,
      name,
      category
    });

    res.status(201).json({ success: true, message: 'Asset added to watchlist', data: item });
  } catch (error) {
    console.error('Watchlist add error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE api/watchlist/remove/:symbol
// @desc    Remove asset from watchlist
router.delete('/remove/:symbol', protect, async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const item = await Watchlist.findOne({ userId: req.user._id.toString(), symbol });

    if (!item) {
      return res.status(404).json({ success: false, message: 'Watchlist item not found' });
    }

    await Watchlist.findByIdAndDelete(item._id);
    res.json({ success: true, message: 'Asset removed from watchlist' });
  } catch (error) {
    console.error('Watchlist remove error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
