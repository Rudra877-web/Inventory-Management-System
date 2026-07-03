import mongoose from 'mongoose';
import { getModel } from '../config/db.js';

const notificationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['Reminder', 'Alert', 'News', 'System'], 
    default: 'System' 
  },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

export const Notification = getModel('Notification', notificationSchema);
