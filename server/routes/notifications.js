import express from 'express';
import { Notification } from '../models/Notification.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Helper to pre-populate mock notifications if none exist
const seedMockNotifications = async (userId) => {
  const count = await Notification.countDocuments({ userId });
  if (count === 0) {
    const mocks = [
      {
        userId,
        message: 'Your monthly SIP of $150 in WealthBuilder Fund is due in 3 days.',
        type: 'SIP Reminder',
        isRead: false
      },
      {
        userId,
        message: 'Market Alert: Bitcoin crossed $65,000! Up 3.2% today.',
        type: 'Portfolio Alert',
        isRead: false
      },
      {
        userId,
        message: 'KYC Verification: Please complete your KYC under Settings to enable full withdrawal features.',
        type: 'System',
        isRead: false
      },
      {
        userId,
        message: 'Global markets open higher following positive employment data updates.',
        type: 'Market News',
        isRead: true
      }
    ];

    for (const m of mocks) {
      await Notification.create(m);
    }
  }
};

// @route   GET api/notifications
// @desc    Get user's notifications
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    await seedMockNotifications(userId);

    const notifications = await Notification.find({ userId });
    // Sort descending (latest first)
    notifications.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    res.json({ success: true, data: notifications });
  } catch (error) {
    console.error('Fetch notifications error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT api/notifications/read/:id
// @desc    Mark notification as read
router.put('/read/:id', protect, async (req, res) => {
  try {
    const notif = await Notification.findById(req.params.id);
    if (!notif || notif.userId !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    const updated = await Notification.findByIdAndUpdate(notif._id, { isRead: true }, { new: true });
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Update notification error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT api/notifications/read-all
// @desc    Mark all notifications as read
router.put('/read-all', protect, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const result = await Notification.find({ userId, isRead: false });

    for (const notif of result) {
      await Notification.findByIdAndUpdate(notif._id, { isRead: true });
    }

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
export { seedMockNotifications };
