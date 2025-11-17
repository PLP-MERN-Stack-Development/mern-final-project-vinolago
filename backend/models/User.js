const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: false,
    unique: true
  },
  firstName: {
    type: String,
    required: false
  },
  lastName: {
    type: String,
    required: false
  },
  phoneNumber: {
    type: String,
    required: false
  },
  role: {
    type: String,
    enum: ['buyer', 'seller', 'admin'],
    default: 'buyer'
  },
  wallet: {
    balance: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'KES'
    },
    transactions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction'
    }]
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  profileComplete: {
    type: Boolean,
    default: false
  },
  // Verification details
  verificationDetails: {
    fullName: String,
    dob: Date,
    address: {
      street: String,
      city: String,
      county: String,
      postalCode: String
    },
    phone: String,
    idType: {
      type: String,
      enum: ['national_id', 'passport', 'driver_license']
    },
    idNumber: String,
    payoutMethod: {
      type: String,
      enum: ['mpesa', 'bank']
    },
    bankDetails: {
      bankName: String,
      accountName: String,
      accountNumber: String,
      bankBranch: String
    },
    mpesaNumber: String,
    referralCode: String,
    agreeTerms: {
      type: Boolean,
      default: false
    },
    agreePrivacy: {
      type: Boolean,
      default: false
    }
  },
  paymentDetails: {
    paymentMethod: {
      type: String,
      enum: ['mpesa', 'bank']
    },
    // M-Pesa details
    firstName: String,
    lastName: String,
    nationalId: String,
    phoneNumber: String,
    // Bank details
    bankName: String,
    accountNumber: String,
    accountName: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('User', userSchema);