const Booking = require('../models/Booking');
const Car = require('../models/Car');
const locationService = require('../services/locationService');

/**
 * Validate pickup location (Samastipur only)
 */
async function validatePickup(req, res, next) {
    try {
        const { lat, lng } = req.body;

        if (!lat || !lng) {
            return res.status(400).json({
                success: false,
                error: 'Latitude and longitude are required'
            });
        }

        // Add delay to respect Nominatim rate limit
        await locationService.delay(1000);

        const validation = await locationService.validateSamastipurLocation(
            parseFloat(lat),
            parseFloat(lng)
        );

        res.json(validation);
    } catch (error) {
        next(error);
    }
}

/**
 * Create booking without fare calculation
 */
async function createBooking(req, res, next) {
    try {
        const {
            car_id,
            pickup_address,
            pickup_lat,
            pickup_lng,
            destination_address,
            customer_name,
            customer_phone
        } = req.body;

        // Find car
        const car = await Car.findById(car_id);

        if (!car || !car.is_active) {
            return res.status(404).json({
                success: false,
                error: 'Car not found or not available'
            });
        }

        // Validate pickup is in Samastipur if coordinates provided
        if (pickup_lat && pickup_lng) {
            await locationService.delay(1000);
            const pickupValidation = await locationService.validateSamastipurLocation(
                parseFloat(pickup_lat),
                parseFloat(pickup_lng)
            );

            if (!pickupValidation.isValid) {
                return res.status(400).json({
                    success: false,
                    error: pickupValidation.reason
                });
            }
        }

        // Create booking without fare calculation
        const booking = new Booking({
            car_id: car._id,
            pickup_address,
            pickup_lat: pickup_lat || null,
            pickup_lng: pickup_lng || null,
            destination_address,
            destination_lat: null,
            destination_lng: null,
            distance_km: null,
            fare_amount: null,
            customer_name: customer_name || '',
            customer_phone,
            status: 'pending'
        });

        await booking.save();

        // Return response
        res.json({
            success: true,
            booking_id: booking._id,
            car: {
                id: car._id,
                name: car.name,
                image_url: car.image_url
            }
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Get all bookings (admin only)
 */
async function getAllBookings(req, res, next) {
    try {
        const bookings = await Booking.find()
            .populate('car_id')
            .sort({ created_at: -1 });

        res.json({
            success: true,
            data: bookings
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Update booking status (admin only)
 */
async function updateBookingStatus(req, res, next) {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status. Must be pending, confirmed, or cancelled.'
            });
        }

        const booking = await Booking.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        ).populate('car_id');

        if (!booking) {
            return res.status(404).json({
                success: false,
                error: 'Booking not found'
            });
        }

        res.json({
            success: true,
            data: booking
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    validatePickup,
    createBooking,
    getAllBookings,
    updateBookingStatus
};
