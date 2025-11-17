const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  assetType: {
    type: String,
    required: true,
    enum: ['domain', 'website', 'app', 'saas business', 'other']
  },
  assetTitle: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'KES'
  },
  escrowFee: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['agreement', 'payment', 'transfer', 'inspection', 'awaiting_admin_payout', 'completed', 'cancelled', 'disputed'],
    default: 'agreement'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'funded', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  // Parties involved
  seller: {
    clerkId: { type: String, required: false },
    email: { type: String, required: false },
    name: { type: String },
    phone: { type: String }
  },
  buyer: {
    clerkId: { type: String, required: false },
    email: { type: String, required: false },
    name: { type: String },
    phone: { type: String }
  },
  // Transaction details
  terms: {
    type: String,
    enum: ['single', 'staged'],
    default: 'single'
  },
  deadline: {
    type: Date,
    required: true
  },
  inspectionPeriod: {
    type: Number, // days
    default: 3
  },
  inspectionPeriodEnd: {
    type: Date
  },
  
  // Invoice details
  invoiceNumber: {
    type: String,
    unique: true
  },

  // Asset transfer details
  transferDetails: {
    method: String,
    recipientInfo: String,
    notes: String,
    completedAt: Date
  },
  // Payment details
  paymentDetails: {
    method: String,
    reference: String,
    completedAt: Date
  },
  // Dispute handling
  dispute: {
    raised: { type: Boolean, default: false },
    raisedBy: String, // 'buyer' or 'seller'
    reason: String,
    status: {
      type: String,
      enum: ['open', 'resolved', 'escalated'],
      default: 'open'
    },
    createdAt: Date
  },
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date
});

// Indexes for performance
transactionSchema.index({ 'seller.clerkId': 1 });
transactionSchema.index({ 'buyer.clerkId': 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ createdAt: -1 });

// Update the updatedAt field before saving
transactionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();

  // Set inspection period end when moving to inspection status
  if (this.status === 'inspection' && !this.inspectionPeriodEnd) {
    this.inspectionPeriodEnd = new Date(Date.now() + (this.inspectionPeriod * 24 * 60 * 60 * 1000));
  }

  next();
});

// Generate unique transaction ID and invoice number
transactionSchema.pre('save', function(next) {
  if (this.isNew && !this.transactionId) {
    this.transactionId = 'ET' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
  }
  if (this.isNew && !this.invoiceNumber) {
    this.invoiceNumber = 'INV' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Transaction', transactionSchema);