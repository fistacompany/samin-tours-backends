const axios = require('axios');

const NOMINATIM_URL = process.env.NOMINATIM_API_URL || 'https://nominatim.openstreetmap.org';

// User agent required by Nominatim usage policy
const headers = {
    'User-Agent': 'SaminToursTravels/1.0'
};

/**
 * Reverse geocode coordinates to address
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<object>} Address details
 */
async function reverseGeocode(lat, lng) {
    try {
        const response = await axios.get(`${NOMINATIM_URL}/reverse`, {
            params: {
                lat,
                lon: lng,
                format: 'json',
                addressdetails: 1
            },
            headers
        });

        return {
            success: true,
            address: response.data.display_name,
            details: response.data.address
        };
    } catch (error) {
        console.error('Reverse geocoding error:', error.message);
        return {
            success: false,
            error: 'Failed to reverse geocode location'
        };
    }
}

/**
 * Geocode address to coordinates
 * @param {string} address - Address string
 * @returns {Promise<object>} Coordinates and address details
 */
async function geocodeAddress(address) {
    try {
        const response = await axios.get(`${NOMINATIM_URL}/search`, {
            params: {
                q: address,
                format: 'json',
                addressdetails: 1,
                limit: 1
            },
            headers
        });

        if (response.data.length === 0) {
            return {
                success: false,
                error: 'Address not found'
            };
        }

        const result = response.data[0];
        return {
            success: true,
            lat: parseFloat(result.lat),
            lng: parseFloat(result.lon),
            address: result.display_name,
            details: result.address
        };
    } catch (error) {
        console.error('Geocoding error:', error.message);
        return {
            success: false,
            error: 'Failed to geocode address'
        };
    }
}

/**
 * Validate if location is in Samastipur, Bihar
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<object>} Validation result
 */
async function validateSamastipurLocation(lat, lng) {
    const result = await reverseGeocode(lat, lng);

    if (!result.success) {
        return {
            isValid: false,
            reason: 'Could not verify location'
        };
    }

    const address = result.details;

    // Check if location is in Samastipur district, Bihar
    const district = address.county || address.state_district || '';
    const state = address.state || '';

    const isSamastipur = district.toLowerCase().includes('samastipur');
    const isBihar = state.toLowerCase().includes('bihar');

    if (isSamastipur && isBihar) {
        return {
            isValid: true,
            formattedAddress: result.address
        };
    }

    return {
        isValid: false,
        reason: 'Pickup must be in Samastipur, Bihar. Currently we only operate pickups from Samastipur.'
    };
}

/**
 * Calculate distance between two points using Haversine formula
 * Returns road distance estimate (Haversine * 1.3 for road factor)
 * @param {object} pickup - {lat, lng}
 * @param {object} destination - {lat, lng}
 * @returns {number} Distance in kilometers
 */
function calculateDistance(pickup, destination) {
    const R = 6371; // Earth's radius in km

    const lat1 = pickup.lat * Math.PI / 180;
    const lat2 = destination.lat * Math.PI / 180;
    const deltaLat = (destination.lat - pickup.lat) * Math.PI / 180;
    const deltaLng = (destination.lng - pickup.lng) * Math.PI / 180;

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) *
        Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const straightLineDistance = R * c;

    // Apply road factor (1.3x) to approximate actual road distance
    const roadDistance = straightLineDistance * 1.3;

    return Math.ceil(roadDistance); // Round up to nearest km
}

// Add delay to respect Nominatim rate limit (1 request per second)
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
    reverseGeocode,
    geocodeAddress,
    validateSamastipurLocation,
    calculateDistance,
    delay
};
