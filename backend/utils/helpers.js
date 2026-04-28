// ====================================================
// VOTEGUIDE AI — Helper Utilities
// ====================================================

const { v4: uuidv4 } = require('uuid');

/**
 * Generate a unique user ID
 * @returns {string}
 */
function generateId() {
  return uuidv4();
}

/**
 * Validate age input
 * @param {*} age
 * @returns {{ valid: boolean, value?: number, error?: string }}
 */
function validateAge(age) {
  const parsed = parseInt(age, 10);
  if (isNaN(parsed) || parsed < 1 || parsed > 150) {
    return { valid: false, error: 'Age must be a number between 1 and 150.' };
  }
  return { valid: true, value: parsed };
}

/**
 * Validate location input
 * @param {*} location
 * @returns {{ valid: boolean, value?: string, error?: string }}
 */
function validateLocation(location) {
  if (!location || typeof location !== 'string' || location.trim().length === 0) {
    return { valid: false, error: 'Location is required.' };
  }
  if (location.trim().length > 100) {
    return { valid: false, error: 'Location must be under 100 characters.' };
  }
  return { valid: true, value: location.trim() };
}

/**
 * Sanitize a string to prevent basic injection
 * @param {string} str
 * @returns {string}
 */
function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[<>]/g, '');
}

module.exports = { generateId, validateAge, validateLocation, sanitize };
