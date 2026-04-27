const REMOTE_EXPLAIN_PROXY_URL = 'https://wolandvp-beep-ai-math-1-4-8e2f.twc1.net';
const LOCAL_EXPLAIN_PROXY_URL = '/';

export const ENV = {
  API_MODE: 'mock',
  API_BASE_URL: '/api',
  EXPLAIN_PROXY_URL: REMOTE_EXPLAIN_PROXY_URL, // preserve v1 explanation behavior by default
  EXPLAIN_PROXY_FALLBACK_URL: LOCAL_EXPLAIN_PROXY_URL, // v2 improvement: local FastAPI backend can be used as fallback
  APP_NAME: 'Решайка',
  DEFAULT_LANGUAGE: 'ru',
  ENABLE_DEMO_FALLBACK: true,
};
