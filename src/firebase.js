// src/firebase.js — Google OAuth configuration + localStorage database

// Google OAuth Client ID from environment
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Simple localStorage-based database helper
// Replaces Firestore for local-first data persistence
const DB_PREFIX = 'pathnexis_';

export const localDB = {
  getUser(uid) {
    const data = localStorage.getItem(`${DB_PREFIX}user_${uid}`);
    return data ? JSON.parse(data) : null;
  },

  setUser(uid, data) {
    const existing = this.getUser(uid) || {};
    const merged = { ...existing, ...data };
    localStorage.setItem(`${DB_PREFIX}user_${uid}`, JSON.stringify(merged));
    return merged;
  },

  updateUser(uid, updates) {
    return this.setUser(uid, updates);
  },

  deleteUser(uid) {
    localStorage.removeItem(`${DB_PREFIX}user_${uid}`);
  },

  // Generic collection support
  getCollection(name) {
    const data = localStorage.getItem(`${DB_PREFIX}col_${name}`);
    return data ? JSON.parse(data) : [];
  },

  setCollection(name, data) {
    localStorage.setItem(`${DB_PREFIX}col_${name}`, JSON.stringify(data));
  },

  addToCollection(name, item) {
    const col = this.getCollection(name);
    col.push({ ...item, id: Date.now().toString(), createdAt: new Date().toISOString() });
    this.setCollection(name, col);
    return col;
  }
};
