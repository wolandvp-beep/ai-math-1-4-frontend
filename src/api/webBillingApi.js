import { ENV } from '../config/env.js';
import { buildJsonHeaders } from './requestContext.js';

export async function createWebBillingSession(token, payload) {
  const response = await fetch(`${ENV.API_BASE_URL}/billing/web-session`, {
    method: 'POST',
    headers: buildJsonHeaders({ token }),
    body: JSON.stringify(payload)
  });

  const raw = await response.text();
  let data = {};
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    throw new Error('Сервер оплаты вернул непонятный ответ.');
  }

  if (!response.ok) throw new Error(data.error || data.detail?.error || `HTTP ${response.status}`);
  return data;
}

export async function fetchAccessStatus(token) {
  const response = await fetch(`${ENV.API_BASE_URL}/billing/access-status`, {
    headers: buildJsonHeaders({ token })
  });

  const raw = await response.text();
  let data = {};
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    throw new Error('Сервер доступа вернул непонятный ответ.');
  }

  if (!response.ok) throw new Error(data.error || data.detail?.error || `HTTP ${response.status}`);
  return data;
}
