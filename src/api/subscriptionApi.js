import { ENV } from '../config/env.js';
import { buildJsonHeaders } from './requestContext.js';

export async function fetchSubscription(token) {
  const response = await fetch(`${ENV.API_BASE_URL}/billing/subscription`, {
    headers: buildJsonHeaders({ token })
  });

  const raw = await response.text();
  let data = {};
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    throw new Error('Сервер подписки вернул непонятный ответ.');
  }

  if (!response.ok) throw new Error(data.error || data.detail?.error || `HTTP ${response.status}`);
  return data;
}
