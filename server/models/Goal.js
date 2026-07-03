import mongoose from 'mongoose';
import { getModel } from '../config/db.js';

const goalSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  targetAmount: { type: Number, required: true },
  currentAmount: { type: Number, default: 0 },
  deadline: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['Active', 'Achieved', 'Cancelled'], 
    default: 'Active' 
  }
}, { timestamps: true });

export const Goal = getModel('Goal', goalSchema);
