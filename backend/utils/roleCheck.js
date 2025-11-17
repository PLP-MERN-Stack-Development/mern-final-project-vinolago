const User = require('../models/User');

// Check if user has required role
const checkRole = (requiredRole) => {
  return async (req, res, next) => {
    try {
      const user = await User.findOne({ clerkId: req.user.clerkId });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (user.role !== requiredRole && user.role !== 'admin') {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      req.user.role = user.role;
      req.user.dbUser = user;
      next();
    } catch (error) {
      console.error('Role check error:', error);
      return res.status(500).json({ error: 'Authorization check failed' });
    }
  };
};

// Check if user is involved in transaction
const checkTransactionAccess = (action) => {
  return async (req, res, next) => {
    try {
      const Transaction = require('../models/Transaction');
      const transactionId = req.params.id;

      const transaction = await Transaction.findOne({ transactionId });

      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      const isSeller = transaction.seller.clerkId === req.user.clerkId;
      const isBuyer = transaction.buyer.clerkId === req.user.clerkId;
      const isAdmin = req.user.role === 'admin';

      // Define permissions based on action
      const permissions = {
        view: isSeller || isBuyer || isAdmin,
        update: isSeller || isBuyer || isAdmin,
        delete: isSeller || isAdmin,
        fund: isBuyer,
        transfer: isSeller,
        accept: isBuyer,
        dispute: isSeller || isBuyer
      };

      if (!permissions[action]) {
        return res.status(403).json({ error: 'Not authorized for this action' });
      }

      req.transaction = transaction;
      req.user.isSeller = isSeller;
      req.user.isBuyer = isBuyer;
      next();
    } catch (error) {
      console.error('Transaction access check error:', error);
      return res.status(500).json({ error: 'Access check failed' });
    }
  };
};

// Check if user can perform action based on transaction status
const checkTransactionStatus = (allowedStatuses) => {
  return (req, res, next) => {
    if (!allowedStatuses.includes(req.transaction.status)) {
      return res.status(400).json({
        error: `Action not allowed in current transaction status: ${req.transaction.status}`
      });
    }
    next();
  };
};

module.exports = {
  checkRole,
  checkTransactionAccess,
  checkTransactionStatus
};