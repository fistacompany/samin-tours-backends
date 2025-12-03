const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticateAdmin } = require('../middleware/auth');
const { bookingValidationRules, validate } = require('../middleware/validators');

// Public routes
router.post('/validate-pickup', bookingController.validatePickup);

router.post('/create',
    bookingValidationRules,
    validate,
    bookingController.createBooking
);

// Admin routes
router.get('/',
    authenticateAdmin,
    bookingController.getAllBookings
);

router.put('/:id',
    authenticateAdmin,
    bookingController.updateBookingStatus
);

module.exports = router;
