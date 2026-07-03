import mongoose from 'mongoose';
import { getModel } from '../config/db.js';

const investmentSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Stocks', 'Mutual Funds', 'SIP', 'Gold', 'Crypto', 'Fixed Deposit', 'Real Estate'],
    required: true 
  },
  name: { type: String, required: true },
  symbol: { type: String, required: true },
  shares: { type: Number, required: true }, // quantity/units
  buyPrice: { type: Number, required: true }, // average cost price
  currentPrice: { type: Number, required: true }, // current market price
  date: { type: Date, default: Date.now }
}, { timestamps: true });

export const Investment = getModel('Investment', investmentSchema);
