const { body, param, query, validationResult } = require('express-validator');

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

// Transaction validation rules
const validateTransactionCreation = [
  body('transactionTitle')
    .trim()
    .notEmpty().withMessage('Transaction title is required')
    .isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
  
  body('role')
    .notEmpty().withMessage('Role is required')
    .isIn(['buyer', 'seller']).withMessage('Role must be either buyer or seller'),
  
  body('assetType')
    .notEmpty().withMessage('Asset type is required')
    .isIn(['domain', 'website', 'app', 'saas business', 'other']).withMessage('Invalid asset type'),
  
  body('assetTitle')
    .trim()
    .notEmpty().withMessage('Asset title is required')
    .isLength({ min: 2, max: 100 }).withMessage('Asset title must be between 2 and 100 characters'),
  
  body('assetDescription')
    .trim()
    .notEmpty().withMessage('Asset description is required')
    .isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  
  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 1 }).withMessage('Price must be a positive number'),
  
  body('terms')
    .notEmpty().withMessage('Terms are required')
    .isIn(['single', 'staged']).withMessage('Terms must be either single or staged'),
  
  body('deadline')
    .notEmpty().withMessage('Deadline is required')
    .isISO8601().withMessage('Invalid date format')
    .custom((value) => {
      const deadline = new Date(value);
      const now = new Date();
      if (deadline <= now) {
        throw new Error('Deadline must be in the future');
      }
      return true;
    }),
  
  body('buyerEmail')
    .optional()
    .isEmail().withMessage('Invalid buyer email format')
    .normalizeEmail(),
  
  body('sellerEmail')
    .optional()
    .isEmail().withMessage('Invalid seller email format')
    .normalizeEmail(),
  
  body('buyerContact')
    .optional()
    .trim()
    .matches(/^\+?[0-9]{10,15}$/).withMessage('Invalid phone number format'),
  
  body('sellerContact')
    .optional()
    .trim()
    .matches(/^\+?[0-9]{10,15}$/).withMessage('Invalid phone number format'),
  
  handleValidationErrors
];

// User profile update validation
const validateProfileUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('First name can only contain letters'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('Last name can only contain letters'),
  
  body('phoneNumber')
    .optional()
    .trim()
    .matches(/^\+?[0-9]{10,15}$/).withMessage('Invalid phone number format'),
  
  handleValidationErrors
];

// Profile verification validation
const validateProfileVerification = [
  body('fullName')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 3, max: 100 }).withMessage('Full name must be between 3 and 100 characters'),
  
  body('dob')
    .notEmpty().withMessage('Date of birth is required')
    .isISO8601().withMessage('Invalid date format')
    .custom((value) => {
      const dob = new Date(value);
      const age = (Date.now() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      if (age < 18) {
        throw new Error('You must be at least 18 years old');
      }
      if (age > 120) {
        throw new Error('Invalid date of birth');
      }
      return true;
    }),
  
  body('idType')
    .notEmpty().withMessage('ID type is required')
    .isIn(['national_id', 'passport', 'driver_license']).withMessage('Invalid ID type'),
  
  body('idNumber')
    .trim()
    .notEmpty().withMessage('ID number is required')
    .isLength({ min: 5, max: 20 }).withMessage('ID number must be between 5 and 20 characters'),
  
  body('payoutMethod')
    .notEmpty().withMessage('Payout method is required')
    .isIn(['mpesa', 'bank']).withMessage('Invalid payout method'),
  
  body('bankName')
    .if(body('payoutMethod').equals('bank'))
    .trim()
    .notEmpty().withMessage('Bank name is required for bank payout'),
  
  body('accountNumber')
    .if(body('payoutMethod').equals('bank'))
    .trim()
    .notEmpty().withMessage('Account number is required for bank payout')
    .isLength({ min: 8, max: 20 }).withMessage('Invalid account number'),
  
  body('accountName')
    .if(body('payoutMethod').equals('bank'))
    .trim()
    .notEmpty().withMessage('Account name is required for bank payout'),
  
  body('mpesaNumber')
    .if(body('payoutMethod').equals('mpesa'))
    .trim()
    .notEmpty().withMessage('M-Pesa number is required for M-Pesa payout')
    .matches(/^\+?254[0-9]{9}$/).withMessage('Invalid M-Pesa number format (use +254XXXXXXXXX)'),
  
  body('agreeTerms')
    .notEmpty().withMessage('You must agree to terms')
    .isBoolean().withMessage('Invalid value for terms agreement')
    .equals('true').withMessage('You must agree to terms'),
  
  body('agreePrivacy')
    .notEmpty().withMessage('You must agree to privacy policy')
    .isBoolean().withMessage('Invalid value for privacy agreement')
    .equals('true').withMessage('You must agree to privacy policy'),
  
  handleValidationErrors
];

// Payment validation
const validatePayment = [
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^\+?254[0-9]{9}$/).withMessage('Invalid phone number format (use +254XXXXXXXXX)'),
  
  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isFloat({ min: 1 }).withMessage('Amount must be a positive number'),
  
  body('transactionId')
    .trim()
    .notEmpty().withMessage('Transaction ID is required')
    .matches(/^ET[0-9]+[A-Z0-9]{5}$/).withMessage('Invalid transaction ID format'),
  
  handleValidationErrors
];

// Transaction ID parameter validation
const validateTransactionId = [
  param('id')
    .trim()
    .notEmpty().withMessage('Transaction ID is required')
    .matches(/^ET[0-9]+[A-Z0-9]{5}$/).withMessage('Invalid transaction ID format'),
  
  handleValidationErrors
];

// Status update validation
const validateStatusUpdate = [
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['agreement', 'payment', 'transfer', 'inspection', 'completed', 'cancelled', 'disputed'])
    .withMessage('Invalid status'),
  
  handleValidationErrors
];

// Dispute validation
const validateDispute = [
  body('reason')
    .trim()
    .notEmpty().withMessage('Dispute reason is required')
    .isLength({ min: 20, max: 1000 }).withMessage('Reason must be between 20 and 1000 characters'),
  
  handleValidationErrors
];

// Asset transfer validation
const validateAssetTransfer = [
  body('transferMethod')
    .trim()
    .notEmpty().withMessage('Transfer method is required')
    .isLength({ min: 2, max: 50 }).withMessage('Transfer method must be between 2 and 50 characters'),
  
  body('recipientInfo')
    .trim()
    .notEmpty().withMessage('Recipient info is required')
    .isLength({ min: 5, max: 200 }).withMessage('Recipient info must be between 5 and 200 characters'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Notes must not exceed 500 characters'),
  
  handleValidationErrors
];

// Query parameter validation for pagination
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateTransactionCreation,
  validateProfileUpdate,
  validateProfileVerification,
  validatePayment,
  validateTransactionId,
  validateStatusUpdate,
  validateDispute,
  validateAssetTransfer,
  validatePagination
};
