const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    car_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Car',
        required: true
    },
    pickup_address: {
        type: String,
        required: true
    },
    pickup_lat: {
        type: Number,
        required: false
    },
    pickup_lng: {
        type: Number,
        required: false
    },
    destination_address: {
        type: String,
        required: true
    },
    destination_lat: {
        type: Number,
        required: false
    },
    destination_lng: {
        type: Number,
        required: false
    },
    distance_km: {
        type: Number,
        required: false,
        min: 0
    },
    fare_amount: {
        type: Number,
        required: false,
        min: 0
    },
    customer_name: {
        type: String,
        trim: true
    },
    customer_phone: {
        type: String,
        required: true,
        match: /^[6-9][0-9]{9}$/
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled'],
        default: 'pending'
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Booking', bookingSchema);
