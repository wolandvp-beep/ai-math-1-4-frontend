const LEADING_FILLER_SENTENCE = /^(?:отлично|давай(?:те)?|хорошо|молодец|правильно|посмотрим|разбер[её]мся|начн[её]м)(?=[\s!?.:,]|$)[^.!?\n]*[.!?]\s*/i;
const OPENERS_TO_REMOVE = /^(?:отлично|давай(?:те)?|хорошо|молодец|правильно|посмотрим|разбер[её]мся|начн[её]м)(?=[\s!?.:,]|$)/i;

function normalizeSectionLabel(line) {
  const trimmed = String(line || '').trim();
  if (!trimmed) return '';

  if (/^ответ\s*:/i.test(trimmed)) {
    return `Ответ: ${trimmed.replace(/^ответ\s*:/i, '').trim()}`.trim();
  }
  if (/^совет\s*:/i.test(trimmed)) {
    return `Совет: ${trimmed.replace(/^совет\s*:/i, '').trim()}`.trim();
  }
  if (/^проверка\s*:/i.test(trimmed)) {
    return `Проверка: ${trimmed.replace(/^проверка\s*:/i, '').trim()}`.trim();
  }

  return trimmed;
}

export function normalizeAssistantText(text) {
  if (!text) return '';

  let prepared = String(text)
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
    .replace(/\b(Запомни|Памятка)\b\s*[—:-]?/gi, 'Совет: ')
    .replace(/\s*(Ответ\s*:)/gi, '\n$1')
    .replace(/\s*(Совет\s*:)/gi, '\n$1')
    .replace(/\s*(Проверка\s*:)/gi, '\n$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  while (LEADING_FILLER_SENTENCE.test(prepared)) {
    prepared = prepared.replace(LEADING_FILLER_SENTENCE, '');
  }

  const seen = new Set();
  const lines = prepared
    .split(/\n+/)
    .map(line => line.trim())
    .filter(Boolean)
    .filter(line => !OPENERS_TO_REMOVE.test(line))
    .map(normalizeSectionLabel)
    .map(line => line.replace(/^Совет:\s*Совет:\s*/i, 'Совет: '))
    .map(line => line.replace(/^Ответ:\s*Ответ:\s*/i, 'Ответ: '))
    .map(line => line.replace(/^Проверка:\s*Проверка:\s*/i, 'Проверка: '))
    .filter(line => {
      const key = line.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

  return lines.join('\n').trim();
}

export function escapeHtml(str) {
  return String(str).replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]));
}
