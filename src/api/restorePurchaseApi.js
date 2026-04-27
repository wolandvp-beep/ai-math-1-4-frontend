import { ENV } from '../config/env.js';
import { buildJsonHeaders } from './requestContext.js';

export async function restorePurchase(token) {
  const response = await fetch(`${ENV.API_BASE_URL}/billing/restore`, {
    method: 'POST',
    headers: buildJsonHeaders({ token })
  });

  const raw = await response.text();
  let data = {};
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    throw new Error('Сервер восстановления покупки вернул непонятный ответ.');
  }

  if (!response.ok) throw new Error(data.error || data.detail?.error || `HTTP ${response.status}`);
  return data;
}
