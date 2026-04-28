// ====================================================
// VOTEGUIDE AI — User Model
// ====================================================

/**
 * User data shape:
 * {
 *   id:           string   — UUID
 *   age:          number   — user's age
 *   location:     string   — state / region
 *   registered:   boolean  — voter registration status
 *   journeyStep:  number   — current step (1-4)
 *   timestamp:    string   — ISO timestamp of last update
 *   createdAt:    string   — ISO timestamp of creation
 *   updatedAt:    string   — ISO timestamp of last update
 * }
 */

/**
 * Create a new User object with defaults
 * @param {object} data — partial user data
 * @returns {object} complete user object
 */
function createUser(data = {}) {
  return {
    id: data.id || null,
    age: data.age || null,
    location: data.location || '',
    registered: data.registered ?? null,
    journeyStep: data.journeyStep || 1,
    timestamp: new Date().toISOString(),
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Validate that a user object has required fields for saving
 * @param {object} user
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateUser(user) {
  const errors = [];

  if (user.age !== null && (typeof user.age !== 'number' || user.age < 1 || user.age > 150)) {
    errors.push('Invalid age value.');
  }

  if (user.location && typeof user.location !== 'string') {
    errors.push('Location must be a string.');
  }

  if (user.registered !== null && typeof user.registered !== 'boolean') {
    errors.push('Registered must be a boolean.');
  }

  if (user.journeyStep && (user.journeyStep < 1 || user.journeyStep > 4)) {
    errors.push('Journey step must be between 1 and 4.');
  }

  return { valid: errors.length === 0, errors };
}

module.exports = { createUser, validateUser };
