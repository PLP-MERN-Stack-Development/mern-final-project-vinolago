const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const Transaction = require('../models/Transaction');

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  // For now, we'll check if the user has admin role
  // You can implement proper admin role checking here
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Get all transactions awaiting admin payout
router.get('/payouts', requireAdmin, async (req, res) => {
  try {
    const transactions = await Transaction.find({
      status: 'awaiting_admin_payout'
    }).sort({ updatedAt: -1 });

    res.json({
      success: true,
      transactions: transactions.map(t => ({
        transactionId: t.transactionId,
        title: t.title,
        buyer: t.buyer,
        seller: t.seller,
        amount: t.amount,
        paymentDetails: t.paymentDetails,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt
      }))
    });
  } catch (error) {
    console.error('Error fetching payouts:', error);
    res.status(500).json({ error: 'Failed to fetch payouts' });
  }
});

// Disburse funds to seller
router.post('/payouts/:transactionId/disburse', requireAdmin, async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndUpdate(
      { transactionId: req.params.transactionId, status: 'awaiting_admin_payout' },
      {
        status: 'completed',
        completedAt: new Date(),
        'paymentDetails.disbursedAt': new Date(),
        'paymentDetails.disbursedBy': req.user.clerkId
      },
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found or not awaiting payout' });
    }

    // Here you would integrate with M-Pesa API to disburse funds
    // For now, we'll just mark as completed

    res.json({
      success: true,
      message: 'Funds disbursed successfully',
      transaction: {
        transactionId: transaction.transactionId,
        status: transaction.status,
        amount: transaction.amount
      }
    });
  } catch (error) {
    console.error('Error disbursing funds:', error);
    res.status(500).json({ error: 'Failed to disburse funds' });
  }
});

// Get wallet summary
router.get('/wallet-summary', requireAdmin, async (req, res) => {
  try {
    // All transactions with paymentStatus 'completed' (funded)
    const fundedTransactions = await Transaction.find({
      paymentStatus: 'completed'
    });

    // Transactions awaiting admin payout
    const awaitingPayout = await Transaction.find({
      status: 'awaiting_admin_payout'
    });

    // Completed transactions (funds disbursed)
    const completedTransactions = await Transaction.find({
      status: 'completed',
      'paymentDetails.disbursedAt': { $exists: true }
    });

    const totalInEscrow = fundedTransactions.reduce((sum, t) => sum + t.amount, 0);
    const awaitingPayoutTotal = awaitingPayout.reduce((sum, t) => sum + t.amount, 0);
    const totalReleased = completedTransactions.reduce((sum, t) => sum + t.amount, 0);

    res.json({
      success: true,
      totalInEscrow,
      awaitingPayout: awaitingPayoutTotal,
      totalReleased
    });
  } catch (error) {
    console.error('Error fetching wallet summary:', error);
    res.status(500).json({ error: 'Failed to fetch wallet summary' });
  }
});

module.exports = router;