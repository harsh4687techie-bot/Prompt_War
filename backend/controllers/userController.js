// ====================================================
// VOTEGUIDE AI — User Controller
// ====================================================

const { generateId, sanitize } = require('../utils/helpers');
const { findById, upsert } = require('../utils/db');
const { createUser, validateUser } = require('../models/User');

/**
 * POST /api/save
 * Save or update user data
 */
async function saveUser(req, res) {
  try {
    const { id, age, location, registered, journeyStep } = req.body;

    // Build user object
    const userData = createUser({
      id: id || generateId(),
      age: age ? parseInt(age, 10) : null,
      location: location ? sanitize(location) : '',
      registered: typeof registered === 'boolean' ? registered : null,
      journeyStep: journeyStep ? parseInt(journeyStep, 10) : 1,
    });

    // Validate
    const validation = validateUser(userData);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        errors: validation.errors,
      });
    }

    // Persist
    const saved = upsert(userData);

    return res.json({
      success: true,
      data: saved,
      message: 'User data saved successfully.',
    });

  } catch (err) {
    console.error('[User] Save error:', err.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to save user data.',
    });
  }
}

/**
 * GET /api/user/:id
 * Retrieve user data by ID
 */
async function getUser(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required.',
      });
    }

    const user = findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found.',
      });
    }

    return res.json({
      success: true,
      data: user,
    });

  } catch (err) {
    console.error('[User] Get error:', err.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve user data.',
    });
  }
}

module.exports = { saveUser, getUser };
