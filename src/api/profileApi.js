import { ENV } from '../config/env.js';

export async function fetchProfile(token) {
  const response = await fetch(`${ENV.API_BASE_URL}/user/profile`, {
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
    throw new Error('Сервер профиля вернул непонятный ответ.');
  }

  if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
  return data;
}
