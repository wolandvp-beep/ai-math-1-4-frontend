import { HISTORY_LIMIT, storage } from '../storage/localStorage.js';
import { createEmptyMathPresentation, normalizeStoredPresentation, summarizePresentationText } from '../utils/mathPresentation.js';

export function createAppState(initialRoute = 'solve') {
  const settings = storage.getSettings();
  storage.clearDraft();

  const state = {
    route: initialRoute,
    currentResult: '',
    currentPresentation: createEmptyMathPresentation(''),
    draft: '',
    history: storage.getHistory().map(item => ({
      ...item,
      resultText: item.resultText || item.result || item.presentation?.text || '',
      presentation: normalizeStoredPresentation(item.presentation || { text: item.resultText || item.result || '' })
    })),
    favorites: storage.getFavorites(),
    historyMode: 'all',
    historyQuery: '',
    settings
  };

  return {
    get() { return state; },
    setRoute(route) { state.route = route; },
    setDraft(value) { state.draft = value; },
    setResult(value) {
      state.currentResult = value;
      state.currentPresentation = createEmptyMathPresentation(value);
    },
    setPresentation(presentation) {
      state.currentPresentation = normalizeStoredPresentation(presentation);
      state.currentResult = summarizePresentationText(state.currentPresentation);
    },
    clearHistory() {
      state.history = [];
      state.favorites = [];
      storage.setHistory([]);
      storage.setFavorites([]);
    },
    pushHistory(item) {
      const normalizedItem = {
        ...item,
        resultText: item.resultText || item.result || item.presentation?.text || '',
        presentation: normalizeStoredPresentation(item.presentation || { text: item.resultText || item.result || '' })
      };

      state.history = [normalizedItem, ...state.history]
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
