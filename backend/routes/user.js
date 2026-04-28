// ====================================================
// VOTEGUIDE AI — User Routes
// ====================================================

const express = require('express');
const router = express.Router();
const { saveUser, getUser } = require('../controllers/userController');

// POST /api/save — store user data
router.post('/', saveUser);

// GET /api/user/:id — retrieve user data
router.get('/:id', getUser);

module.exports = router;
