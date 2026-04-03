import { ENV } from '../config/env.js';

async function request(path, payload) {
  const response = await fetch(`${ENV.API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const raw = await response.text();
  let data = {};
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    throw new Error('Сервер auth вернул непонятный ответ.');
  }

  if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
  return data;
}

export const authApi = {
  async login(payload) {
    return request('/auth/login', payload);
  },
  async register(payload) {
    return request('/auth/register', payload);
  },
  async recover(payload) {
    return request('/auth/recover', payload);
  },
  async logout(payload) {
    return request('/auth/logout', payload || {});
  }
};
