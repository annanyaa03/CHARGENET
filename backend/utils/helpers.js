const { v4: uuidv4 } = require('uuid');

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Calculate total booking amount
 * pricePerKwh: decimal
 * estimatedUnits: decimal (units expected to be consumed)
 * duration: hours (used as a multiplier if units not preferred, or for service fee)
 */
const calculateBookingAmount = (duration, pricePerKwh, estimatedUnits) => {
  // Simple logic: Units * Price
  // You can add a base service fee here if needed
  const amount = parseFloat(estimatedUnits) * parseFloat(pricePerKwh);
  return parseFloat(amount.toFixed(2));
};

/**
 * Generate a unique booking reference
 */
const generateBookingReference = () => {
  return `CN-${uuidv4().substring(0, 8).toUpperCase()}`;
};

module.exports = {
  haversineDistance,
  calculateBookingAmount,
  generateBookingReference
};
