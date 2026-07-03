import express from 'express';
import { KYC } from '../models/KYC.js';
import { User } from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET api/kyc
// @desc    Get user's KYC status
router.get('/', protect, async (req, res) => {
  try {
    const kyc = await KYC.findOne({ userId: req.user._id.toString() });
    res.json({
      success: true,
      kycStatus: req.user.kycStatus,
      kycDetails: kyc
    });
  } catch (error) {
    console.error('Fetch KYC error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST api/kyc/submit
// @desc    Submit KYC documents details
router.post('/submit', protect, async (req, res) => {
  const { panNumber, aadhaarNumber } = req.body;

  try {
    if (!panNumber || !aadhaarNumber) {
      return res.status(400).json({ success: false, message: 'Please enter PAN and Aadhaar numbers' });
    }

    // Format check
    if (panNumber.length !== 10) {
      return res.status(400).json({ success: false, message: 'Invalid PAN Card number. Must be 10 characters.' });
    }
    if (aadhaarNumber.length !== 12) {
      return res.status(400).json({ success: false, message: 'Invalid Aadhaar Card number. Must be 12 digits.' });
    }

    if (req.user.kycStatus === 'Approved') {
      return res.status(400).json({ success: false, message: 'KYC is already approved.' });
    }

    let kyc = await KYC.findOne({ userId: req.user._id.toString() });

    if (kyc) {
      // Update existing pending/rejected application
      kyc = await KYC.findByIdAndUpdate(kyc._id, {
        panNumber,
        aadhaarNumber,
        status: 'Pending',
        submittedAt: new Date(),
        remarks: ''
      }, { new: true });
    } else {
      // Create new application
      kyc = await KYC.create({
        userId: req.user._id.toString(),
        panNumber,
        aadhaarNumber,
        status: 'Pending'
      });
    }

    // Update User model status
    await User.findByIdAndUpdate(req.user._id, { kycStatus: 'Pending' });

    res.json({
      success: true,
      message: 'KYC documents submitted successfully. Status is now Pending Approval.',
      kycDetails: kyc
    });
  } catch (error) {
    console.error('KYC submit error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
