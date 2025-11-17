const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const User = require('../models/User');

// Update user payment details
router.post('/payment-details', requireAuth, async (req, res) => {
  try {
    const {
      paymentMethod,
      firstName,
      lastName,
      nationalId,
      phoneNumber,
      bankName,
      accountNumber,
      accountName
    } = req.body;

    const updateData = {
      'paymentDetails.paymentMethod': paymentMethod
    };

    if (paymentMethod === 'mpesa') {
      updateData['paymentDetails.firstName'] = firstName;
      updateData['paymentDetails.lastName'] = lastName;
      updateData['paymentDetails.nationalId'] = nationalId;
      updateData['paymentDetails.phoneNumber'] = phoneNumber;
    } else if (paymentMethod === 'bank') {
      updateData['paymentDetails.bankName'] = bankName;
      updateData['paymentDetails.accountNumber'] = accountNumber;
      updateData['paymentDetails.accountName'] = accountName;
    }

    const user = await User.findOneAndUpdate(
      { clerkId: req.user.clerkId },
      updateData,
      { new: true, upsert: true }
    );

    res.json({ success: true, user });
  } catch (error) {
    console.error('Payment details update error:', error);
    res.status(500).json({ error: 'Failed to update payment details' });
  }
});

module.exports = router;