import { ENV } from '../config/env.js';

export async function createWebBillingSession(token, payload) {
  const response = await fetch(`${ENV.API_BASE_URL}/billing/web-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: JSON.stringify(payload)
  });

  const raw = await response.text();
  let data = {};
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    throw new Error('Сервер оплаты вернул непонятный ответ.');
  }

  if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
  return data;
}

export async function fetchAccessStatus(token) {
  const response = await fetch(`${ENV.API_BASE_URL}/billing/access-status`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
  });

  const raw = await response.text();
  let data = {};
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    throw new Error('Сервер доступа вернул непонятный ответ.');
  }

  if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
  return data;
}
