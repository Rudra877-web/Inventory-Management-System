import mongoose from 'mongoose';
import { getModel } from '../config/db.js';

const activityLogSchema = new mongoose.Schema({
  userId: { type: String }, // Can be null if it's failed login attempt
  action: { type: String, required: true }, // e.g. "Login Success", "Password Reset Attempt"
  ipAddress: { type: String },
  userAgent: { type: String },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

export const ActivityLog = getModel('ActivityLog', activityLogSchema);
