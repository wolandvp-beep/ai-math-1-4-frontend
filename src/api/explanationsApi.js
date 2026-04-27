import { ENV } from '../config/env.js';
import { buildJsonHeaders } from './requestContext.js';

const PRIMARY_PROXY_URL = ENV.EXPLAIN_PROXY_URL;
const FALLBACK_PROXY_URL = ENV.EXPLAIN_PROXY_FALLBACK_URL;
const API_EXPLANATIONS_URL = typeof ENV.API_BASE_URL === 'string' && ENV.API_BASE_URL && !ENV.API_BASE_URL.includes('your-backend.example.com')
  ? `${ENV.API_BASE_URL}/explanations`
  : '';
const LIMIT_MESSAGE_MARKER = 'Лимит решений на сегодня уже исчерпан';

async function requestExplanation(proxyUrl, text) {
  if (!proxyUrl) {
    throw new Error('Не задан адрес сервера.');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: buildJsonHeaders({}),
      body: JSON.stringify(proxyUrl.endsWith('/explanations') ? { text } : { action: 'explain', text }),
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

    if (!response.ok || data.error) {
      const message = data?.error || `HTTP ${response.status}`;
      const error = new Error(message);
      error.limitReached = response.status === 429 || String(message).includes(LIMIT_MESSAGE_MARKER);
      error.access = data?.access || null;
      throw error;
    }

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
  const urls = [API_EXPLANATIONS_URL, PRIMARY_PROXY_URL, FALLBACK_PROXY_URL]
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
      if (error?.limitReached) break;
    }
  }

  throw lastError || new Error('Не удалось получить объяснение.');
}
