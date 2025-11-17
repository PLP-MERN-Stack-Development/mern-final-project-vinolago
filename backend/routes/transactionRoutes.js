const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { checkTransactionAccess, checkTransactionStatus } = require('../utils/roleCheck');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Invoice = require('../models/Invoice');
//const Resend = require('resend');

//const resend = new Resend(process.env.RESEND_API_KEY);

async function getNextInvoiceNumber() {
  const counter = await Invoice.findOneAndUpdate(
    { name: "invoice" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  // Format as "000001"
  return `${counter.seq.toString().padStart(6, "0")}`;
}
// Create new transaction
router.post('/', requireAuth, async (req, res) => {
  try {
    
    const {
      transactionTitle,
      role,
      assetType,
      assetTitle,
      assetDescription,
      price,
      terms,
      deadline,
      buyerEmail,
      buyerContact,
      sellerEmail,
      sellerContact,
    } = req.body;


    // Calculate escrow fee (0.5%)
    const amount = parseFloat(price);
    const escrowFee = Math.round(amount * 0.0025);

    const invoiceNumber = await getNextInvoiceNumber();

    // Create transaction based on role
    const transactionData = {
      title: transactionTitle,
      description: assetDescription,
      assetType,
      assetTitle,
      amount,
      escrowFee,
      terms,
      deadline: new Date(deadline),
      invoiceNumber,
    };

    // Helper: safely extract user details
    const firstName = req.user.paymentDetails?.firstName || req.user.firstName || '';
    const lastName = req.user.paymentDetails?.lastName || req.user.lastName || '';
    const phoneNumber = req.user.paymentDetails?.phoneNumber || req.user.phone || '';

    if (role === 'seller') {
      // User is seller, so they provide buyer details
      transactionData.seller = {
        clerkId: req.user.clerkId,
        email: req.user.email,
        name: `${firstName} ${lastName}`.trim() || 'Seller',
        phone: phoneNumber || sellerContact || '',
      };
      transactionData.buyer = {
        email: buyerEmail,
        phone: buyerContact,
        name: 'Pending Buyer', // Will be updated when buyer joins
      };
    } else {
      // User is buyer, so they provide seller details
      transactionData.buyer = {
        clerkId: req.user.clerkId,
        email: req.user.email,
        name: `${firstName} ${lastName}`.trim() || 'Buyer',
        phone: phoneNumber || buyerContact || '',
      };
      transactionData.seller = {
        email: sellerEmail,
        phone: sellerContact,
        name: 'Pending Seller', // Will be updated when seller joins
      };
    }

    const transaction = new Transaction(transactionData);
    await transaction.save();


    /* const inviteLink = `http://localhost:5173/signup?invite=${transaction._id}`;

      await resend.emails.send({
      from: 'Escrow' <transactions@escrow.co.ke>',
      to: role === 'buyer' ? sellerEmail : buyerEmail, 
      subject: Urgent: You're invited to a transaction,
      html: `
      <h2>Please agree to the transaction </p>
      <p>Hi ${user.email}</p>
      <p>You've just received a transaction invite from ${user.email}. Feels good right? </p>
      <p>Please review the terms and agree to the transaction now.</p>
      <a href="${inviteLink}">Review and Agree</a>

      <p>Sincerely, <br /> Escrow</p>
      `
    }) 
      */

    res.status(201).json({
      success: true,
      transaction: {
        id: transaction.transactionId,
        status: transaction.status,
        amount: transaction.amount,
        escrowFee: transaction.escrowFee
      }
    });
  } catch (error) {
    console.error('Transaction creation error:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

// Get transaction by ID
router.get('/:id', requireAuth, checkTransactionAccess('view'), async (req, res) => {
  try {
    const transaction = req.transaction;

    // Determine current user role
    const currentUserRole = req.user.isSeller ? 'seller' : 'buyer';

    res.json({
      id: transaction.transactionId,
      title: transaction.title,
      description: transaction.description,
      assetType: transaction.assetType,
      assetTitle: transaction.assetTitle,
      amount: transaction.amount,
      escrowFee: transaction.escrowFee,
      status: transaction.status,
      paymentStatus: transaction.paymentStatus,
      seller: transaction.seller,
      buyer: transaction.buyer,
      deadline: transaction.deadline,
      inspectionPeriod: transaction.inspectionPeriod,
      inspectionPeriodEnd: transaction.inspectionPeriodEnd,
      invoiceNumber: transaction.invoiceNumber,
      currentUserRole,
      createdAt: transaction.createdAt
    });
  } catch (error) {
    console.error('Transaction fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

// Update transaction status (internal use)
router.put('/:id/status', requireAuth, checkTransactionAccess('update'), async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['agreement', 'payment', 'transfer', 'inspection', 'completed', 'cancelled'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const transaction = await Transaction.findOneAndUpdate(
      { transactionId: req.params.id },
      { status },
      { new: true }
    );

    res.json({ success: true, status: transaction.status });
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Initiate payment
router.post('/:id/initiate-payment', requireAuth, checkTransactionAccess('fund'), checkTransactionStatus(['agreement']), async (req, res) => {
  try {
    const { paymentMethod } = req.body;

    // Update transaction status and payment details
    const transaction = await Transaction.findOneAndUpdate(
      { transactionId: req.params.id },
      {
        status: 'payment',
        paymentStatus: 'processing',
        'paymentDetails.method': paymentMethod,
        'paymentDetails.reference': `PAY-${Date.now()}`
      },
      { new: true }
    );

    // Here you would integrate with M-Pesa API
    // For now, simulate payment processing
    setTimeout(async () => {
      await Transaction.findOneAndUpdate(
        { transactionId: req.params.id },
        {
          paymentStatus: 'completed',
          'paymentDetails.completedAt': new Date(),
          status: 'transfer'
        }
      );
    }, 5000); // Simulate 5 second processing

    res.json({
      success: true,
      paymentReference: transaction.paymentDetails.reference,
      message: 'Payment initiated. Check your phone for M-Pesa prompt.'
    });
  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({ error: 'Failed to initiate payment' });
  }
});

// Confirm payment
router.post('/:id/confirm-payment', requireAuth, checkTransactionAccess('view'), async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndUpdate(
      { transactionId: req.params.id },
      {
        paymentStatus: 'completed',
        'paymentDetails.completedAt': new Date(),
        status: 'transfer'
      },
      { new: true }
    );

    res.json({ success: true, status: transaction.status });
  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
});

// Transfer asset
router.post('/:id/transfer-asset', requireAuth, checkTransactionAccess('transfer'), checkTransactionStatus(['transfer']), async (req, res) => {
  try {
    const { transferMethod, recipientInfo, notes } = req.body;

    const transaction = await Transaction.findOneAndUpdate(
      { transactionId: req.params.id },
      {
        status: 'inspection',
        transferDetails: {
          method: transferMethod,
          recipientInfo,
          notes,
          completedAt: new Date()
        }
      },
      { new: true }
    );

    res.json({
      success: true,
      status: transaction.status,
      inspectionPeriodEnd: transaction.inspectionPeriodEnd
    });
  } catch (error) {
    console.error('Asset transfer error:', error);
    res.status(500).json({ error: 'Failed to transfer asset' });
  }
});

// Accept asset
router.post('/:id/accept-asset', requireAuth, checkTransactionAccess('accept'), checkTransactionStatus(['inspection']), async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndUpdate(
      { transactionId: req.params.id },
      {
        status: 'completed',
        completedAt: new Date()
      },
      { new: true }
    );

    // Here you would release funds to seller
    // Update seller's wallet balance

    res.json({ success: true, status: transaction.status });
  } catch (error) {
    console.error('Asset acceptance error:', error);
    res.status(500).json({ error: 'Failed to accept asset' });
  }
});

// Release funds (buyer action after accepting asset)
router.post('/:id/release-funds', requireAuth, checkTransactionAccess('accept'), checkTransactionStatus(['inspection']), async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndUpdate(
      { transactionId: req.params.id },
      {
        status: 'awaiting_admin_payout',
        'paymentDetails.releasedAt': new Date()
      },
      { new: true }
    );

    res.json({ success: true, status: transaction.status });
  } catch (error) {
    console.error('Fund release error:', error);
    res.status(500).json({ error: 'Failed to release funds' });
  }
});

// Raise dispute
router.post('/:id/dispute', requireAuth, checkTransactionAccess('dispute'), async (req, res) => {
  try {
    const { reason } = req.body;

    const transaction = await Transaction.findOneAndUpdate(
      { transactionId: req.params.id },
      {
        'dispute.raised': true,
        'dispute.raisedBy': req.user.isSeller ? 'seller' : 'buyer',
        'dispute.reason': reason,
        'dispute.status': 'open',
        'dispute.createdAt': new Date()
      },
      { new: true }
    );

    res.json({
      success: true,
      dispute: transaction.dispute
    });
  } catch (error) {
    console.error('Dispute creation error:', error);
    res.status(500).json({ error: 'Failed to raise dispute' });
  }
});

// Get user's transactions
router.get('/', requireAuth, async (req, res) => {
  try {
    const transactions = await Transaction.find({
      $or: [
        { 'seller.clerkId': req.user.clerkId },
        { 'buyer.clerkId': req.user.clerkId }
      ]
    }).sort({ createdAt: -1 });

    const formattedTransactions = transactions.map(t => ({
      id: t.transactionId,
      title: t.title,
      assetType: t.assetType,
      amount: t.amount,
      status: t.status,
      paymentStatus: t.paymentStatus,
      createdAt: t.createdAt,
      isSeller: t.seller.clerkId === req.user.clerkId
    }));

    res.json({ transactions: formattedTransactions });
  } catch (error) {
    console.error('Transactions fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Simulation endpoints for testing (only in development)
if (process.env.NODE_ENV !== 'production') {
  // Simulate payment completion
  router.post('/:id/simulate-payment', requireAuth, async (req, res) => {
    try {
      const transaction = await Transaction.findOneAndUpdate(
        { transactionId: req.params.id, status: 'payment' },
        {
          status: 'transfer',
          paymentStatus: 'completed',
          'paymentDetails.completedAt': new Date(),
          'paymentDetails.simulated': true
        },
        { new: true }
      );

      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found or not in payment stage' });
      }

      res.json({ success: true, message: 'Payment simulated successfully', transaction });
    } catch (error) {
      console.error('Payment simulation error:', error);
      res.status(500).json({ error: 'Failed to simulate payment' });
    }
  });

  // Simulate asset transfer
  router.post('/:id/simulate-transfer', requireAuth, async (req, res) => {
    try {
      const transaction = await Transaction.findOneAndUpdate(
        { transactionId: req.params.id, status: 'transfer' },
        {
          status: 'inspection',
          transferDetails: {
            method: 'simulated',
            recipientInfo: 'Test transfer',
            notes: 'Simulated asset transfer',
            completedAt: new Date(),
            simulated: true
          }
        },
        { new: true }
      );

      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found or not in transfer stage' });
      }

      res.json({ success: true, message: 'Asset transfer simulated successfully', transaction });
    } catch (error) {
      console.error('Transfer simulation error:', error);
      res.status(500).json({ error: 'Failed to simulate transfer' });
    }
  });

  // Simulate admin disbursement
  router.post('/:id/simulate-disbursement', requireAuth, async (req, res) => {
    try {
      const transaction = await Transaction.findOneAndUpdate(
        { transactionId: req.params.id, status: 'awaiting_admin_payout' },
        {
          status: 'completed',
          completedAt: new Date(),
          'paymentDetails.disbursedAt': new Date(),
          'paymentDetails.disbursedBy': 'simulated-admin',
          'paymentDetails.simulatedDisbursement': true
        },
        { new: true }
      );

      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found or not awaiting payout' });
      }

      res.json({ success: true, message: 'Disbursement simulated successfully', transaction });
    } catch (error) {
      console.error('Disbursement simulation error:', error);
      res.status(500).json({ error: 'Failed to simulate disbursement' });
    }
  });
}

module.exports = router;