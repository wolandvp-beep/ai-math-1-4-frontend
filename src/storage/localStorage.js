export const HISTORY_LIMIT = 30;

const KEYS = {
  draft: 'reshayka_draft',
  history: 'reshayka_history',
  favorites: 'reshayka_favorites',
  settings: 'reshayka_settings'
};

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function normalizeHistory(value) {
  return Array.isArray(value) ? value.slice(0, HISTORY_LIMIT) : [];
}

export const storage = {
  getDraft() { return read(KEYS.draft, ''); },
  setDraft(value) { write(KEYS.draft, value); },
  getHistory() { return normalizeHistory(read(KEYS.history, [])); },
  setHistory(value) { write(KEYS.history, normalizeHistory(value)); },
  getFavorites() { return read(KEYS.favorites, []); },
  setFavorites(value) { write(KEYS.favorites, value); },
  getSettings() { return read(KEYS.settings, { language: 'ru' }); },
  setSettings(value) { write(KEYS.settings, value); }
};
