import mongoose from 'mongoose';
import { getModel } from '../config/db.js';

const transactionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['Deposit', 'Withdraw', 'Buy', 'Sell'], 
    required: true 
  },
  category: { type: String, required: true }, // e.g. "Stocks", "Crypto", "Wallet"
  symbol: { type: String }, // e.g. "AAPL" (if applicable)
  shares: { type: Number }, // units (if applicable)
  price: { type: Number }, // price per unit (if applicable)
  amount: { type: Number, required: true }, // total transaction value
  status: { 
    type: String, 
    enum: ['Completed', 'Pending', 'Failed'], 
    default: 'Completed' 
  },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

export const Transaction = getModel('Transaction', transactionSchema);
