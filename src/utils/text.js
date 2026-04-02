export function normalizeAssistantText(text) {
  if (!text) return '';
  return String(text)
    .replace(/\r/g, '')
    .replace(/\*\*/g, '')
    .replace(/__/g, '')
    .replace(/`/g, '')
    .replace(/#{1,6}\s*/g, '')
    .replace(/\\\(/g, '')
    .replace(/\\\)/g, '')
    .replace(/\\\[/g, '')
    .replace(/\\\]/g, '')
    .replace(/\\/g, '')
    .replace(/^\s*\d+[.)]\s*/gm, '')
    .replace(/^\s*Шаг\s*\d+\s*:?\s*/gim, '')
    .replace(/^\s*(Запомни|Памятка)\s*[—:-]?\s*/gim, 'Совет: ')
    .replace(/\b(Запомни|Памятка)\b\s*[—:-]?/gi, 'Совет:')
    .replace(/Совет:\s*Совет:/gi, 'Совет:')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[m]));
}

export function truncateText(value, max = 120) {
  const text = String(value || '').trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max).trim()}…`;
}

export function getTaskTypeLabel(text) {
  const value = String(text || '').toLowerCase();
  if (!value.trim()) return 'Новая задача';
  if (/\b(x|х)\b|=/.test(value) && /[+\-*/×:]/.test(value)) return 'Уравнение';
  if (value.includes('дроб') || /\d+\s*\/\s*\d+/.test(value)) return 'Дроби';
  if (value.includes('периметр') || value.includes('площад') || value.includes('прямоугольник') || value.includes('треуголь')) return 'Геометрия';
  if (value.includes('сколько') || value.includes('было') || value.includes('осталось') || value.includes('отдали')) return 'Текстовая задача';
  if (/[+\-*/×:]/.test(value)) return 'Пример';
  return 'Задача';
}

export function formatAssistantTextForHtml(text) {
  const normalized = normalizeAssistantText(text);
  const safe = escapeHtml(normalized);
  const paragraphs = safe
    .split(/\n{2,}/)
    .map(block => block.trim())
    .filter(Boolean)
    .map(block => `<p>${block.replace(/\n/g, '<br>')}</p>`);

  return paragraphs.join('') || '<div class="result-placeholder">Здесь появится объяснение, ответ и короткий совет.</div>';
}
