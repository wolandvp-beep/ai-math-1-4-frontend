import { ru } from './ru.js';

const dictionaries = { ru };

export function detectLanguage() {
  const lang = (navigator.language || 'ru').toLowerCase();
  if (lang.startsWith('ru')) return 'ru';
  return 'ru';
}

export function createI18n() {
  let current = detectLanguage();
  return {
    get language() { return current; },
    setLanguage(next) { current = dictionaries[next] ? next : 'ru'; },
    t(key) { return dictionaries[current]?.[key] || key; }
  };
}
