function getWindowSafe() {
  return typeof window !== 'undefined' ? window : undefined;
}

function getRuntimeOverride(key) {
  const win = getWindowSafe();
  const fromWindow = String(win?.__RESHAYKA_CONFIG__?.[key] || '').trim();
  if (fromWindow) return fromWindow;

  try {
    const fromStorage = String(win?.localStorage?.getItem(`reshayka:${key}`) || '').trim();
    return fromStorage;
  } catch {
    return '';
  }
}

function isLocalDevelopment() {
  const hostname = getWindowSafe()?.location?.hostname || '';
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

function resolveApiBaseUrl() {
  const override = getRuntimeOverride('API_BASE_URL');
  if (override) return override;
  if (isLocalDevelopment()) return 'http://127.0.0.1:8000/api';
  return 'https://your-backend.example.com/api';
}

function resolveExplainProxyUrl() {
  const override = getRuntimeOverride('EXPLAIN_PROXY_URL');
  if (override) return override;
  if (isLocalDevelopment()) return 'http://127.0.0.1:8000/';
  return 'https://wolandvp-beep-ai-math-1-4-8e2f.twc1.net';
}

export const ENV = {
  API_BASE_URL: resolveApiBaseUrl(),
  EXPLAIN_PROXY_URL: resolveExplainProxyUrl(),
  APP_NAME: 'Решайка',
  DEFAULT_LANGUAGE: 'ru',
  ENABLE_DEMO_FALLBACK: true,
  API_MODE: 'mock' // mock | remote
};
