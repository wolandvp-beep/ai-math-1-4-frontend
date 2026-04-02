import { storage } from '../storage/localStorage.js';

export function createAppState(initialRoute = 'solve') {
  const settings = storage.getSettings();
  const state = {
    route: initialRoute,
    currentResult: '',
    draft: storage.getDraft(),
    history: storage.getHistory(),
    favorites: storage.getFavorites(),
    historyMode: 'all',
    historyQuery: '',
    settings
  };

  return {
    get() { return state; },
    setRoute(route) { state.route = route; },
    setDraft(value) { state.draft = value; storage.setDraft(value); },
    setResult(value) { state.currentResult = value; },
    pushHistory(item) {
      state.history.unshift(item);
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
