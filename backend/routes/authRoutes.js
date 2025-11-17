const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const User = require('../models/User');

// Sync user data from Clerk to our database
router.post('/sync-user', requireAuth, async (req, res) => {
  try {
    const { clerkId, email, firstName, lastName } = req.user;

    // Check if user exists
    let user = await User.findOne({ clerkId });

    if (!user) {
      // Create new user
      user = new User({
        clerkId,
        email,
        firstName,
        lastName,
        phoneNumber: req.body.phoneNumber || '',
        role: req.body.role || 'buyer'
      });
      await user.save();
    } else {
      // Update existing user
      user.email = email;
      user.firstName = firstName;
      user.lastName = lastName;
      if (req.body.phoneNumber) user.phoneNumber = req.body.phoneNumber;
      await user.save();
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        clerkId: user.clerkId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        wallet: user.wallet
      }
    });
  } catch (error) {
    console.error('User sync error:', error);
    res.status(500).json({ error: 'Failed to sync user data' });
  }
});

// Get current user profile
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const user = await User.findOne({ clerkId: req.user.clerkId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        clerkId: user.clerkId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        role: user.role,
        wallet: user.wallet,
        isVerified: user.isVerified,
        profileComplete: user.profileComplete
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const updates = req.body;
    const allowedUpdates = ['firstName', 'lastName', 'phoneNumber'];

    // Only allow role updates for admin users
    if (req.user.isAdmin && updates.role) {
      allowedUpdates.push('role');
    }

    // Filter allowed updates
    const filteredUpdates = {};
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    const user = await User.findOneAndUpdate(
      { clerkId: req.user.clerkId },
      filteredUpdates,
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        clerkId: user.clerkId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get current user info (for frontend auth context)
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findOne({ clerkId: req.user.clerkId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      clerkId: user.clerkId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isAdmin: user.role === 'admin',
      isVerified: user.isVerified,
      profileComplete: user.profileComplete
    });
  } catch (error) {
    console.error('User info fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch user info' });
  }
});

// Verify user profile
router.post('/verify-profile', requireAuth, async (req, res) => {
  try {
    const {
      fullName,
      dob,
      street,
      city,
      county,
      postalCode,
      phone,
      idType,
      idNumber,
      payoutMethod,
      bankName,
      accountName,
      accountNumber,
      bankBranch,
      mpesaNumber,
      referralCode,
      agreeTerms,
      agreePrivacy
    } = req.body;

    // Validate required fields
    if (!fullName || !dob || !idType || !idNumber || !payoutMethod) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!agreeTerms || !agreePrivacy) {
      return res.status(400).json({ error: 'You must agree to terms and privacy policy' });
    }

    // Validate payout method specific fields
    if (payoutMethod === 'bank' && (!bankName || !accountName || !accountNumber)) {
      return res.status(400).json({ error: 'Bank details are required for bank payout method' });
    }

    if (payoutMethod === 'mpesa' && !mpesaNumber) {
      return res.status(400).json({ error: 'M-Pesa number is required for M-Pesa payout method' });
    }

    // Update user with verification details
    const user = await User.findOneAndUpdate(
      { clerkId: req.user.clerkId },
      {
        profileComplete: true,
        isVerified: true,
        verificationDetails: {
          fullName,
          dob: new Date(dob),
          address: {
            street,
            city,
            county,
            postalCode
          },
          phone,
          idType,
          idNumber,
          payoutMethod,
          bankDetails: payoutMethod === 'bank' ? {
            bankName,
            accountName,
            accountNumber,
            bankBranch
          } : undefined,
          mpesaNumber: payoutMethod === 'mpesa' ? mpesaNumber : undefined,
          referralCode,
          agreeTerms,
          agreePrivacy
        }
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Profile verified successfully',
      user: {
        id: user._id,
        clerkId: user.clerkId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isVerified: user.isVerified,
        profileComplete: user.profileComplete
      }
    });
  } catch (error) {
    console.error('Profile verification error:', error);
    res.status(500).json({ error: 'Failed to verify profile' });
  }
});

module.exports = router;