// ====================================================
// VOTEGUIDE AI — API Service Layer
// ====================================================

import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * POST /assistant — Get decision logic response
 * @param {{ age: number, location: string, registered: boolean }} data
 */
export async function postAssistant(data) {
  const res = await api.post('/assistant', data);
  return res.data;
}

/**
 * POST /save — Save user data
 * @param {{ id?: string, age?: number, location?: string, registered?: boolean, journeyStep?: number }} data
 */
export async function saveUser(data) {
  const res = await api.post('/save', data);
  return res.data;
}

/**
 * GET /user/:id — Retrieve user data
 * @param {string} id
 */
export async function getUser(id) {
  const res = await api.get(`/user/${id}`);
  return res.data;
}

/**
 * GET /status — Health check
 */
export async function getStatus() {
  const res = await api.get('/status');
  return res.data;
}

export default api;
