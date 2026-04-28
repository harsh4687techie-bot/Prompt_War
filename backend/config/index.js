// ====================================================
// VOTEGUIDE AI — Server Configuration
// ====================================================

const config = {
  port: process.env.PORT || 3001,
  corsOrigins: [
    'http://localhost:5173',  // Vite dev server
    'http://localhost:3000',
    'http://127.0.0.1:5173',
  ],
  dataDir: './data',
  dbFile: './data/users.json',
  env: process.env.NODE_ENV || 'development',
};

module.exports = config;
