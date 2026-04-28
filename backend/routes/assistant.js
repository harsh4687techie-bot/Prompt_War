// ====================================================
// VOTEGUIDE AI — Assistant Routes
// ====================================================

const express = require('express');
const router = express.Router();
const { processAssistant } = require('../controllers/assistantController');

// POST /api/assistant — decision logic
router.post('/', processAssistant);

module.exports = router;
