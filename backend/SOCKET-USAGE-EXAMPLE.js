// Example: How to emit Socket.io events from routes

const express = require('express');
const router = express.Router();
const {
  emitTransactionUpdate,
  emitStatusChange,
  emitPaymentUpdate,
  sendNotification,
  emitToUser
} = require('../utils/socket');

// Example 1: Update transaction and notify all parties
router.put('/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Update transaction in database
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('buyer seller');
    
    // Emit real-time update to all users in transaction room
    emitTransactionUpdate(id, updatedTransaction);
    
    // Send notifications to buyer and seller
    sendNotification(updatedTransaction.buyer._id, {
      type: 'info',
      title: 'Transaction Updated',
      message: 'The transaction details have been updated',
      transactionId: id
    });
    
    sendNotification(updatedTransaction.seller._id, {
      type: 'info',
      title: 'Transaction Updated',
      message: 'The transaction details have been updated',
      transactionId: id
    });
    
    res.json({ success: true, transaction: updatedTransaction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Example 2: Update transaction status
router.patch('/transactions/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Update status in database
    const transaction = await Transaction.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('buyer seller');
    
    // Emit status change to transaction room
    emitStatusChange(id, status, {
      previousStatus: transaction.previousStatus,
      updatedBy: req.user.id
    });
    
    // Send targeted notifications based on status
    let notificationMessage = '';
    switch (status) {
      case 'agreement':
        notificationMessage = 'Transaction is awaiting agreement';
        break;
      case 'payment':
        notificationMessage = 'Payment is required to proceed';
        break;
      case 'transfer':
        notificationMessage = 'Asset transfer in progress';
        break;
      case 'confirm':
        notificationMessage = 'Awaiting confirmation';
        break;
      case 'closed':
        notificationMessage = 'Transaction completed successfully';
        break;
    }
    
    // Notify buyer
    sendNotification(transaction.buyer._id, {
      type: status === 'closed' ? 'success' : 'info',
      title: 'Status Update',
      message: notificationMessage,
      transactionId: id
    });
    
    // Notify seller
    sendNotification(transaction.seller._id, {
      type: status === 'closed' ? 'success' : 'info',
      title: 'Status Update',
      message: notificationMessage,
      transactionId: id
    });
    
    res.json({ success: true, transaction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Example 3: Payment update
router.post('/payments/:transactionId/webhook', async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { paymentStatus, amount, reference } = req.body;
    
    // Update payment in database
    const transaction = await Transaction.findByIdAndUpdate(
      transactionId,
      { 
        paymentStatus,
        paymentReference: reference,
        paidAt: paymentStatus === 'completed' ? new Date() : null
      },
      { new: true }
    ).populate('buyer seller');
    
    // Emit payment update
    emitPaymentUpdate(transactionId, {
      paymentStatus,
      amount,
      reference,
      paidAt: transaction.paidAt
    });
    
    // Send success notification if payment completed
    if (paymentStatus === 'completed') {
      sendNotification(transaction.buyer._id, {
        type: 'success',
        title: 'Payment Successful',
        message: `Your payment of KES ${amount} has been received`,
        transactionId
      });
      
      sendNotification(transaction.seller._id, {
        type: 'success',
        title: 'Payment Received',
        message: `Buyer has paid KES ${amount}`,
        transactionId
      });
    } else if (paymentStatus === 'failed') {
      sendNotification(transaction.buyer._id, {
        type: 'error',
        title: 'Payment Failed',
        message: 'Your payment could not be processed. Please try again.',
        transactionId
      });
    }
    
    res.json({ success: true, transaction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Example 4: Create new transaction
router.post('/transactions', async (req, res) => {
  try {
    const transactionData = req.body;
    
    // Create transaction in database
    const newTransaction = await Transaction.create({
      ...transactionData,
      createdBy: req.user.id
    });
    
    await newTransaction.populate('buyer seller');
    
    // Notify seller about new transaction
    sendNotification(newTransaction.seller._id, {
      type: 'info',
      title: 'New Transaction',
      message: `${newTransaction.buyer.name} created a new transaction`,
      transactionId: newTransaction._id
    });
    
    // Emit to buyer's personal room
    emitToUser(newTransaction.buyer._id, 'transaction-created', {
      transaction: newTransaction
    });
    
    res.status(201).json({ success: true, transaction: newTransaction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Example 5: Dispute resolution
router.post('/transactions/:id/dispute', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    // Update transaction
    const transaction = await Transaction.findByIdAndUpdate(
      id,
      { 
        status: 'disputed',
        disputeReason: reason,
        disputedAt: new Date(),
        disputedBy: req.user.id
      },
      { new: true }
    ).populate('buyer seller');
    
    // Emit status change
    emitStatusChange(id, 'disputed', {
      reason,
      disputedBy: req.user.id
    });
    
    // Notify both parties
    const otherParty = transaction.buyer._id.toString() === req.user.id 
      ? transaction.seller._id 
      : transaction.buyer._id;
    
    sendNotification(otherParty, {
      type: 'warning',
      title: 'Transaction Disputed',
      message: 'The other party has raised a dispute',
      transactionId: id
    });
    
    // Notify admin
    // Assuming you have an admin notification system
    emitToUser('admin', 'dispute-created', {
      transactionId: id,
      transaction
    });
    
    res.json({ success: true, transaction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
