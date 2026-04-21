import { ENV } from '../config/env.js';

const PRIMARY_PROXY_URL = ENV.EXPLAIN_PROXY_URL;
const FALLBACK_PROXY_URL = ENV.EXPLAIN_PROXY_FALLBACK_URL;

async function requestExplanation(proxyUrl, text) {
  if (!proxyUrl) {
    throw new Error('Не задан адрес сервера.');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const response = await fetch(proxyUrl, {
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

    const resultText = typeof data.result === 'string'
      ? data.result
      : (typeof data.explanation === 'string' ? data.explanation : '');

    if (!resultText) {
      throw new Error('Неожиданный формат ответа.');
    }

    return resultText;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Сервер отвечает слишком долго. Попробуйте ещё раз.');
    }
    throw error;
  }
}

export async function explainTask(text) {
  const urls = [PRIMARY_PROXY_URL, FALLBACK_PROXY_URL]
    .map((url) => (typeof url === 'string' ? url.trim() : ''))
    .filter(Boolean)
    .filter((url, index, array) => array.indexOf(url) === index);

  if (!urls.length) {
    throw new Error('Не задан адрес сервера.');
  }

  let lastError;
  for (const url of urls) {
    try {
      return await requestExplanation(url, text);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('Не удалось получить объяснение.');
}
