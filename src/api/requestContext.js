import { authTokenStorage } from '../storage/authTokenStorage.js';
import { installIdStorage } from '../storage/installIdStorage.js';

export function buildJsonHeaders({ token, includeAuth = true, includeContentType = true, extra = {} } = {}) {
  const headers = {
    ...(includeContentType ? { 'Content-Type': 'application/json' } : {}),
    'X-Install-Id': installIdStorage.readOrCreate(),
    ...extra,
  };

  const effectiveToken = typeof token === 'string' && token.trim()
    ? token.trim()
    : (includeAuth ? authTokenStorage.read().trim() : '');

  if (effectiveToken) {
    headers.Authorization = `Bearer ${effectiveToken}`;
  }

  return headers;
}
