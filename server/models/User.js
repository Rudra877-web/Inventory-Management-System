import mongoose from 'mongoose';
import { getModel } from '../config/db.js';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String },
  avatar: { type: String, default: '' },
  bankDetails: {
    bankName: { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    ifscCode: { type: String, default: '' }
  },
  kycStatus: { 
    type: String, 
    enum: ['Not Started', 'Pending', 'Approved', 'Rejected'], 
    default: 'Not Started' 
  },
  balance: { type: Number, default: 100000 } // Virtual cash wallet for trades
}, { timestamps: true });

export const User = getModel('User', userSchema);
