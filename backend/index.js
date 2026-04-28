// ====================================================
// VOTEGUIDE AI — Express Server Entry Point
// ====================================================

const express = require('express');
const cors = require('cors');
const config = require('./config');

// Import routes
const assistantRoutes = require('./routes/assistant');
const userRoutes = require('./routes/user');
const statusRoutes = require('./routes/status');

// Initialize Express
const app = express();

// ==================== MIDDLEWARE ====================

// CORS
app.use(cors({
  origin: config.corsOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging (dev only)
if (config.env === 'development') {
  app.use((req, res, next) => {
    const timestamp = new Date().toISOString().slice(11, 19);
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
  });
}

// ==================== ROUTES ====================

app.use('/api/assistant', assistantRoutes);
app.use('/api/save', userRoutes);
app.use('/api/user', userRoutes);
app.use('/api/status', statusRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'VoteGuide AI Backend',
    version: '1.0.0',
    endpoints: {
      assistant: 'POST /api/assistant',
      save: 'POST /api/save',
      user: 'GET /api/user/:id',
      status: 'GET /api/status',
    },
  });
});

// ==================== ERROR HANDLING ====================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.path}`,
  });
});

// Global error handler
app.use((err, req, res, _next) => {
  console.error('[Server Error]', err.stack);
  res.status(500).json({
    success: false,
    error: config.env === 'development' ? err.message : 'Internal server error',
  });
});

// ==================== START SERVER ====================

app.listen(config.port, '127.0.0.1', () => {
  console.log('');
  console.log('  🗳️  VoteGuide AI Backend');
  console.log(`  ✅ Server running on http://127.0.0.1:${config.port}`);
  console.log(`  📋 Environment: ${config.env}`);
  console.log(`  🔗 API docs:    http://127.0.0.1:${config.port}/`);
  console.log('');
});

module.exports = app;
