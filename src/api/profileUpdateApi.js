import { ENV } from '../config/env.js';
import { buildJsonHeaders } from './requestContext.js';

export async function updateProfile(token, payload) {
  const response = await fetch(`${ENV.API_BASE_URL}/user/profile`, {
    method: 'PATCH',
    headers: buildJsonHeaders({ token }),
    body: JSON.stringify(payload)
  });

  const raw = await response.text();
  let data = {};
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    throw new Error('Сервер обновления профиля вернул непонятный ответ.');
  }

  if (!response.ok) throw new Error(data.error || data.detail?.error || `HTTP ${response.status}`);
  return data;
}
