import express from 'express';
import { Investment } from '../models/Investment.js';
import { User } from '../models/User.js';
import { Transaction } from '../models/Transaction.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Mock asset prices
const MOCK_ASSETS = {
  // Stocks
  'AAPL': { name: 'Apple Inc.', price: 175.50, category: 'Stocks' },
  'TSLA': { name: 'Tesla Inc.', price: 180.20, category: 'Stocks' },
  'MSFT': { name: 'Microsoft Corp.', price: 420.10, category: 'Stocks' },
  'AMZN': { name: 'Amazon.com Inc.', price: 185.00, category: 'Stocks' },
  'GOOGL': { name: 'Alphabet Inc.', price: 170.80, category: 'Stocks' },
  // Crypto
  'BTC': { name: 'Bitcoin', price: 65200.00, category: 'Crypto' },
  'ETH': { name: 'Ethereum', price: 3450.00, category: 'Crypto' },
  'SOL': { name: 'Solana', price: 145.50, category: 'Crypto' },
  // Mutual Funds
  'NIFTY50': { name: 'Nifty 50 Index Fund', price: 125.40, category: 'Mutual Funds' },
  'GROWW_BLUE': { name: 'Groww Bluechip Fund', price: 85.20, category: 'Mutual Funds' },
  // Gold
  'GOLD': { name: '24K Gold (1g)', price: 72.80, category: 'Gold' },
  // SIP (Simulated index fund)
  'SIP_INDEX': { name: 'WealthBuilder SIP Fund', price: 150.00, category: 'SIP' }
};

// Helper to get random price fluctuation
const getFluctuatedPrices = () => {
  const fluctuated = {};
  for (const symbol in MOCK_ASSETS) {
    const asset = MOCK_ASSETS[symbol];
    const fluctuationPercent = (Math.random() * 2 - 1) * 0.005; // +/- 0.5%
    const currentPrice = Number((asset.price * (1 + fluctuationPercent)).toFixed(2));
    fluctuated[symbol] = {
      ...asset,
      price: currentPrice,
      changePercent: Number((fluctuationPercent * 100).toFixed(2))
    };
  }
  return fluctuated;
};

// @route   GET api/investments
// @desc    Get user's portfolio and summaries
router.get('/', protect, async (req, res) => {
  try {
    const investments = await Investment.find({ userId: req.user._id });
    const user = await User.findById(req.user._id);
    const livePrices = getFluctuatedPrices();

    let totalInvested = 0;
    let currentPortfolioValue = 0;
    let categoryAllocation = {
      'Stocks': 0,
      'Mutual Funds': 0,
      'SIP': 0,
      'Gold': 0,
      'Crypto': 0,
      'Fixed Deposit': 0,
      'Real Estate': 0
    };

    // Update investment current prices based on mock data & calculate totals
    const updatedInvestments = investments.map(inv => {
      let currentPrice = inv.currentPrice;
      
      // If we have live price for this symbol, update it
      if (livePrices[inv.symbol]) {
        currentPrice = livePrices[inv.symbol].price;
      }

      const totalCost = inv.shares * inv.buyPrice;
      const currentValue = inv.shares * currentPrice;
      
      totalInvested += totalCost;
      currentPortfolioValue += currentValue;
      
      categoryAllocation[inv.category] += currentValue;

      return {
        ...inv,
        currentPrice,
        totalCost: Number(totalCost.toFixed(2)),
        currentValue: Number(currentValue.toFixed(2)),
        profitOrLoss: Number((currentValue - totalCost).toFixed(2)),
        gainPercent: totalCost > 0 ? Number((((currentValue - totalCost) / totalCost) * 100).toFixed(2)) : 0
      };
    });

    const totalProfitLoss = Number((currentPortfolioValue - totalInvested).toFixed(2));
    const profitLossPercent = totalInvested > 0 ? Number(((totalProfitLoss / totalInvested) * 100).toFixed(2)) : 0;
    
    // Calculate today's gain (simulated mock rate +/- 0.8%)
    const todayGainLoss = Number((currentPortfolioValue * (Math.random() * 0.016 - 0.008)).toFixed(2));
    const todayGainPercent = currentPortfolioValue > 0 ? Number(((todayGainLoss / currentPortfolioValue) * 100).toFixed(2)) : 0;

    // Calculate Portfolio Health Score (Mock metric based on diversification)
    const activeCategoriesCount = Object.values(categoryAllocation).filter(val => val > 0).length;
    let healthScore = 50; // default medium
    if (activeCategoriesCount >= 4) healthScore = 92;
    else if (activeCategoriesCount === 3) healthScore = 80;
    else if (activeCategoriesCount === 2) healthScore = 65;
    else if (activeCategoriesCount === 1) healthScore = 45;

    // Risk Analysis (Mock)
    let riskProfile = 'Moderate';
    const cryptoWeight = currentPortfolioValue > 0 ? (categoryAllocation['Crypto'] / currentPortfolioValue) : 0;
    const stockWeight = currentPortfolioValue > 0 ? (categoryAllocation['Stocks'] / currentPortfolioValue) : 0;
    
    if (cryptoWeight > 0.2 || (cryptoWeight + stockWeight) > 0.7) {
      riskProfile = 'Aggressive';
    } else if (categoryAllocation['Fixed Deposit'] > 0.4 || categoryAllocation['Gold'] > 0.3) {
      riskProfile = 'Conservative';
    }

    // AI Suggestions (Mock)
    const suggestions = [];
    if (cryptoWeight > 0.25) {
      suggestions.push({
        type: 'Rebalance',
        message: 'Your Crypto exposure is high. Consider reallocating some profits to Fixed Deposits or Mutual Funds to mitigate volatility.',
        impact: 'High'
      });
    }
    if (activeCategoriesCount < 3) {
      suggestions.push({
        type: 'Diversification',
        message: 'Your portfolio is concentrated. Adding low-correlated assets like Gold or Real Estate can protect against market drawdowns.',
        impact: 'Medium'
      });
    }
    if (categoryAllocation['SIP'] === 0) {
      suggestions.push({
        type: 'Wealth Growth',
        message: 'Set up a SIP (Systematic Investment Plan) to benefit from dollar-cost averaging in Index Funds.',
        impact: 'High'
      });
    }
    if (suggestions.length === 0) {
      suggestions.push({
        type: 'Portfolio Optimization',
        message: 'Your portfolio looks healthy! Consider adding international mutual funds to diversify geographically.',
        impact: 'Low'
      });
    }

    res.json({
      success: true,
      data: {
        investments: updatedInvestments,
        summary: {
          totalInvested: Number(totalInvested.toFixed(2)),
          currentPortfolioValue: Number(currentPortfolioValue.toFixed(2)),
          totalProfitLoss,
          profitLossPercent,
          todayGainLoss,
          todayGainPercent,
          walletBalance: user.balance,
          healthScore,
          riskProfile,
          categoryAllocation
        },
        aiSuggestions: suggestions
      }
    });
  } catch (error) {
    console.error('Fetch portfolio error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST api/investments/buy
// @desc    Buy an asset using wallet balance
router.post('/buy', protect, async (req, res) => {
  const { symbol, shares, buyPrice, category } = req.body;

  try {
    if (!symbol || !shares || !buyPrice || !category) {
      return res.status(400).json({ success: false, message: 'Please enter all fields' });
    }

    const cost = shares * buyPrice;
    const user = await User.findById(req.user._id);

    if (user.balance < cost) {
      return res.status(400).json({ success: false, message: 'Insufficient wallet balance' });
    }

    // Deduct from balance
    const newBalance = Number((user.balance - cost).toFixed(2));
    await User.findByIdAndUpdate(user._id, { balance: newBalance });

    // Find existing investment of same symbol
    let investment = await Investment.findOne({ userId: user._id, symbol });

    if (investment) {
      // Recalculate average price
      const totalShares = investment.shares + Number(shares);
      const totalCost = (investment.shares * investment.buyPrice) + cost;
      const newAveragePrice = Number((totalCost / totalShares).toFixed(2));

      await Investment.findByIdAndUpdate(investment._id, {
        shares: totalShares,
        buyPrice: newAveragePrice,
        currentPrice: buyPrice
      });
    } else {
      // Create new investment entry
      const assetInfo = MOCK_ASSETS[symbol] || { name: symbol };
      await Investment.create({
        userId: user._id,
        category,
        name: assetInfo.name || symbol,
        symbol,
        shares,
        buyPrice,
        currentPrice: buyPrice
      });
    }

    // Create transaction log
    await Transaction.create({
      userId: user._id,
      type: 'Buy',
      category,
      symbol,
      shares,
      price: buyPrice,
      amount: cost,
      status: 'Completed'
    });

    res.json({
      success: true,
      message: `Successfully purchased ${shares} shares of ${symbol}`,
      balance: newBalance
    });
  } catch (error) {
    console.error('Buy asset error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST api/investments/sell
// @desc    Sell an asset and add to wallet balance
router.post('/sell', protect, async (req, res) => {
  const { symbol, shares, sellPrice } = req.body;

  try {
    if (!symbol || !shares || !sellPrice) {
      return res.status(400).json({ success: false, message: 'Please enter all fields' });
    }

    const user = await User.findById(req.user._id);
    const investment = await Investment.findOne({ userId: user._id, symbol });

    if (!investment || investment.shares < shares) {
      return res.status(400).json({ success: false, message: 'Insufficient shares to sell' });
    }

    const earnings = shares * sellPrice;

    // Deduct shares or delete investment entry
    const remainingShares = investment.shares - Number(shares);
    if (remainingShares <= 0) {
      await Investment.findByIdAndDelete(investment._id);
    } else {
      await Investment.findByIdAndUpdate(investment._id, {
        shares: remainingShares
      });
    }

    // Add earnings to user wallet
    const newBalance = Number((user.balance + earnings).toFixed(2));
    await User.findByIdAndUpdate(user._id, { balance: newBalance });

    // Create transaction log
    await Transaction.create({
      userId: user._id,
      type: 'Sell',
      category: investment.category,
      symbol,
      shares,
      price: sellPrice,
      amount: earnings,
      status: 'Completed'
    });

    res.json({
      success: true,
      message: `Successfully sold ${shares} shares of ${symbol}`,
      balance: newBalance
    });
  } catch (error) {
    console.error('Sell asset error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST api/investments/add-manual
// @desc    Manually add investment (for Offline/Real Estate/FDs)
router.post('/add-manual', protect, async (req, res) => {
  const { category, name, symbol, shares, buyPrice, currentPrice, date } = req.body;

  try {
    if (!category || !name || !symbol || !shares || !buyPrice) {
      return res.status(400).json({ success: false, message: 'Please fill out required fields' });
    }

    const inv = await Investment.create({
      userId: req.user._id,
      category,
      name,
      symbol: symbol.toUpperCase(),
      shares,
      buyPrice,
      currentPrice: currentPrice || buyPrice,
      date: date || new Date()
    });

    res.json({ success: true, message: 'Investment added manually', data: inv });
  } catch (error) {
    console.error('Manual investment add error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT api/investments/update/:id
// @desc    Update a manual investment entry
router.put('/update/:id', protect, async (req, res) => {
  const { name, shares, buyPrice, currentPrice, category } = req.body;

  try {
    const inv = await Investment.findById(req.params.id);
    if (!inv || inv.userId !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: 'Investment not found' });
    }

    const updated = await Investment.findByIdAndUpdate(
      req.params.id,
      { name, shares, buyPrice, currentPrice, category },
      { new: true }
    );

    res.json({ success: true, message: 'Investment updated', data: updated });
  } catch (error) {
    console.error('Update investment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE api/investments/delete/:id
// @desc    Delete a manual investment entry
router.delete('/delete/:id', protect, async (req, res) => {
  try {
    const inv = await Investment.findById(req.params.id);
    if (!inv || inv.userId !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: 'Investment not found' });
    }

    await Investment.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Investment deleted successfully' });
  } catch (error) {
    console.error('Delete investment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET api/investments/market
// @desc    Get live mock prices for tickers
router.get('/market', protect, async (req, res) => {
  try {
    const prices = getFluctuatedPrices();
    res.json({ success: true, prices });
  } catch (error) {
    console.error('Market prices fetch error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
export { MOCK_ASSETS, getFluctuatedPrices };
