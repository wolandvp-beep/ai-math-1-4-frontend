import { HISTORY_LIMIT, storage } from '../storage/localStorage.js';

export function createAppState(initialRoute = 'solve') {
  const settings = storage.getSettings();
  storage.clearDraft();

  const state = {
    route: initialRoute,
    currentResult: '',
    draft: '',
    history: storage.getHistory(),
    favorites: storage.getFavorites(),
    historyMode: 'all',
    historyQuery: '',
    settings
  };

  return {
    get() { return state; },
    setRoute(route) { state.route = route; },
    setDraft(value) { state.draft = value; },
    setResult(value) { state.currentResult = value; },
    clearHistory() {
      state.history = [];
      state.favorites = [];
      storage.setHistory([]);
      storage.setFavorites([]);
    },
    pushHistory(item) {
      state.history = [item, ...state.history]
        .slice(0, HISTORY_LIMIT);
      storage.setHistory(state.history);
    },
    toggleFavorite(id) {
      if (state.favorites.includes(id)) {
        state.favorites = state.favorites.filter(x => x !== id);
      } else {
        state.favorites.unshift(id);
      }
      storage.setFavorites(state.favorites);
    },
    setHistoryMode(mode) { state.historyMode = mode; },
    setHistoryQuery(query) { state.historyQuery = query; },
    setLanguage(language) {
      state.settings.language = language;
      storage.setSettings(state.settings);
    }
  };
}
