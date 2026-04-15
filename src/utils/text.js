const LEADING_FILLER_SENTENCE = /^(?:отлично|давай(?:те)?|хорошо|молодец|правильно|посмотрим|разбер[её]мся|начн[её]м)(?=[\s!?.:,]|$)[^.!?\n]*[.!?]\s*/i;
const OPENERS_TO_REMOVE = /^(?:отлично|давай(?:те)?|хорошо|молодец|правильно|посмотрим|разбер[её]мся|начн[её]м)(?=[\s!?.:,]|$)/i;
const ERROR_PREFIX = /^Ошибка:\s*/i;
const TECHNICAL_MAINTENANCE_PATTERN = /(техническ[а-яёa-z-]*\s+обслужив|сервис\s+временно\s+недоступ|service\s+unavailable|maintenance)/i;

function isErrorText(text) {
  return ERROR_PREFIX.test(String(text || '').trim());
}

function stripErrorPrefix(text) {
  return String(text || '').replace(ERROR_PREFIX, '').trim();
}

export function looksLikeTechnicalMaintenancePayload(text) {
  return TECHNICAL_MAINTENANCE_PATTERN.test(stripErrorPrefix(text));
}

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

function dedupeLines(lines, maxLines = 80) {
  const result = [];
  const seen = new Set();

  lines.forEach(line => {
    const cleaned = String(line || '').trim();
    if (!cleaned) return;
    const key = cleaned.toLowerCase().replace(/[.!?]+$/g, '');
    if (seen.has(key)) return;
    seen.add(key);
    result.push(cleaned);
  });

  return result.slice(0, maxLines);
}

export function normalizeAssistantText(text) {
  if (!text) return '';

  const normalizedSource = String(text).replace(/\r/g, '').trim();
  if (looksLikeTechnicalMaintenancePayload(normalizedSource)) {
    return '';
  }

  if (isErrorText(normalizedSource)) {
    return normalizedSource;
  }

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
    .replace(/^\s*(\d+)\.\s+/gm, '$1) ')
    .replace(/^\s*Шаг\s*(\d+)\s*:?\s*/gim, '$1) ')
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

  const parsedLines = dedupeLines(
    prepared
      .split(/\n+/)
      .map(line => line.trim())
      .filter(Boolean)
      .filter(line => !OPENERS_TO_REMOVE.test(line))
      .map(normalizeSectionLabel)
      .map(line => line.replace(/^Совет:\s*Совет:\s*/i, 'Совет: '))
      .map(line => line.replace(/^Ответ:\s*Ответ:\s*/i, 'Ответ: '))
      .map(line => line.replace(/^Проверка:\s*Проверка:\s*/i, 'Проверка: '))
  );

  const bodyLines = [];
  let answerLine = '';
  let adviceLine = '';
  let checkLine = '';

  parsedLines.forEach(line => {
    if (/^Ответ:/i.test(line)) {
      const value = line.replace(/^Ответ:\s*/i, '').trim();
      if (value) answerLine = `Ответ: ${value}`;
      return;
    }
    if (/^Совет:/i.test(line)) {
      const value = line.replace(/^Совет:\s*/i, '').trim();
      if (value) adviceLine = `Совет: ${value}`;
      return;
    }
    if (/^Проверка:/i.test(line)) {
      const value = line.replace(/^Проверка:\s*/i, '').trim();
      if (value && !checkLine) checkLine = `Проверка: ${value}`;
      return;
    }
    bodyLines.push(line);
  });

  if (!answerLine && bodyLines.length) {
    const tail = bodyLines[bodyLines.length - 1];
    const match = tail.match(/=\s*([^=]+)$/);
    if (match?.[1]) {
      answerLine = `Ответ: ${match[1].trim()}`;
    }
  }

  return [...bodyLines, ...(checkLine ? [checkLine] : []), ...(answerLine ? [answerLine] : []), ...(adviceLine ? [adviceLine] : [])]
    .join('\n')
    .trim();
}

export function escapeHtml(str) {
  return String(str).replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]));
}

export function splitExplanationLines(text) {
  const prepared = normalizeAssistantText(text);
  if (!prepared) return [];

  return prepared
    .split(/\n+/)
    .map(line => line.trim())
    .filter(Boolean);
}
