import mongoose from 'mongoose';
import { getModel } from '../config/db.js';

const kycSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  panNumber: { type: String, required: true },
  aadhaarNumber: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected'], 
    default: 'Pending' 
  },
  submittedAt: { type: Date, default: Date.now },
  remarks: { type: String, default: '' }
}, { timestamps: true });

export const KYC = getModel('KYC', kycSchema);
