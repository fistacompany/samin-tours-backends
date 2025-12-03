/**
 * Calculate fare based on distance and car pricing
 * @param {number} distanceKm - Total distance in kilometers
 * @param {number} base100KmFare - Base fare for first 100 km
 * @param {number} extraPerKm - Per km rate after 100 km
 * @returns {number} Total fare amount
 */
function calculateFare(distanceKm, base100KmFare, extraPerKm) {
    if (distanceKm <= 100) {
        return base100KmFare;
    }

    const extraKm = distanceKm - 100;
    return base100KmFare + (extraKm * extraPerKm);
}

/**
 * Get fare breakup details
 * @param {number} distanceKm - Total distance in kilometers
 * @param {number} base100KmFare - Base fare for first 100 km
 * @param {number} extraPerKm - Per km rate after 100 km
 * @returns {object} Fare breakup with base, extra km, and total
 */
function getFareBreakup(distanceKm, base100KmFare, extraPerKm) {
    const totalFare = calculateFare(distanceKm, base100KmFare, extraPerKm);

    if (distanceKm <= 100) {
        return {
            base_100km_fare: base100KmFare,
            extra_km: 0,
            extra_per_km: extraPerKm,
            extra_fare: 0,
            total_fare: totalFare
        };
    }

    const extraKm = distanceKm - 100;
    const extraFare = extraKm * extraPerKm;

    return {
        base_100km_fare: base100KmFare,
        extra_km: Math.ceil(extraKm),
        extra_per_km: extraPerKm,
        extra_fare: extraFare,
        total_fare: totalFare
    };
}

module.exports = {
    calculateFare,
    getFareBreakup
};
