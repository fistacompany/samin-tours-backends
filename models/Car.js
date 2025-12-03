const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  image_url: {
    type: String,
    required: true
  },
  base_100km_fare: {
    type: Number,
    required: true,
    min: 0
  },
  extra_per_km: {
    type: Number,
    required: true,
    min: 0
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Car', carSchema);
