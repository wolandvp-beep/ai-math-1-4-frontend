import { ENV } from '../config/env.js';

const PROXY_URL = ENV.EXPLAIN_PROXY_URL || '';

export async function explainTask(text) {
  if (!PROXY_URL) {
    throw new Error('Не задан адрес сервера. Укажите EXPLAIN_PROXY_URL в config/env.js.');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'explain', text }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const raw = await response.text();
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      throw new Error('Сервер вернул непонятный ответ.');
    }

    if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
    if (data.error) throw new Error(data.error);
    if (typeof data.result !== 'string') throw new Error('Неожиданный формат ответа.');

    return data.result;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Сервер отвечает слишком долго. Попробуйте ещё раз.');
    }
    throw error;
  }
}
