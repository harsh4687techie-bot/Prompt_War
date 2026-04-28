// ====================================================
// VOTEGUIDE AI — JSON File Database Utility
// ====================================================

const fs = require('fs');
const path = require('path');
const config = require('../config');

const DB_PATH = path.resolve(__dirname, '..', config.dbFile);
const DATA_DIR = path.resolve(__dirname, '..', config.dataDir);

/**
 * Ensure the data directory and DB file exist
 */
function ensureDB() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ users: [] }, null, 2), 'utf-8');
  }
}

/**
 * Read the entire database
 * @returns {{ users: Array }} parsed DB content
 */
function readDB() {
  ensureDB();
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('[DB] Read error:', err.message);
    return { users: [] };
  }
}

/**
 * Write the entire database
 * @param {object} data — full DB object to persist
 */
function writeDB(data) {
  ensureDB();
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DB] Write error:', err.message);
  }
}

/**
 * Find a user by ID
 * @param {string} id
 * @returns {object|null}
 */
function findById(id) {
  const db = readDB();
  return db.users.find((u) => u.id === id) || null;
}

/**
 * Insert or update a user record
 * @param {object} userData — must include `id`
 * @returns {object} the upserted user
 */
function upsert(userData) {
  const db = readDB();
  const idx = db.users.findIndex((u) => u.id === userData.id);

  if (idx !== -1) {
    db.users[idx] = { ...db.users[idx], ...userData, updatedAt: new Date().toISOString() };
  } else {
    db.users.push({ ...userData, createdAt: new Date().toISOString() });
  }

  writeDB(db);
  return idx !== -1 ? db.users[idx] : db.users[db.users.length - 1];
}

module.exports = { readDB, writeDB, findById, upsert, ensureDB };
