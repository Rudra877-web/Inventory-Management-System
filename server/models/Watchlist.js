import mongoose from 'mongoose';
import { getModel } from '../config/db.js';

const watchlistSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  symbol: { type: String, required: true },
  category: { type: String, required: true }, // Stocks, Crypto, Gold, Mutual Funds
  name: { type: String, required: true }
}, { timestamps: true });

export const Watchlist = getModel('Watchlist', watchlistSchema);
