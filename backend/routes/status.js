// ====================================================
// VOTEGUIDE AI — Status / Health Check Route
// ====================================================

const express = require('express');
const router = express.Router();

// GET /api/status — health check
router.get('/', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    service: 'VoteGuide AI Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()) + 's',
  });
});

module.exports = router;
