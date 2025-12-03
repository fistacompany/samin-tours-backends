const { body, validationResult } = require('express-validator');

/**
 * Validation rules for phone number
 */
const phoneValidation = body('customer_phone')
    .matches(/^[6-9][0-9]{9}$/)
    .withMessage('Phone number must be a valid 10-digit Indian mobile number');

/**
 * Validation rules for booking calculation
 */
const bookingValidationRules = [
    body('car_id').notEmpty().withMessage('Car ID is required'),
    body('pickup_address').notEmpty().withMessage('Pickup address is required'),
    body('destination_address').notEmpty().withMessage('Destination address is required'),
    phoneValidation,
    body('customer_name').optional().trim()
];

/**
 * Validation rules for car creation/update
 */
const carValidationRules = [
    body('name').notEmpty().trim().withMessage('Car name is required'),
    body('base_100km_fare').isFloat({ min: 0 }).withMessage('Base fare must be a positive number'),
    body('extra_per_km').isFloat({ min: 0 }).withMessage('Extra per km must be a positive number')
];

/**
 * Middleware to check validation results
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }
    next();
};

module.exports = {
    phoneValidation,
    bookingValidationRules,
    carValidationRules,
    validate
};
