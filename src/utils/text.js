const LEADING_FILLER_SENTENCE = /^(?:отлично|давай(?:те)?|хорошо|молодец|правильно|посмотрим|разбер[её]мся|начн[её]м)(?=[\s!?.:,]|$)[^.!?\n]*[.!?]\s*/i;
const OPENERS_TO_REMOVE = /^(?:отлично|давай(?:те)?|хорошо|молодец|правильно|посмотрим|разбер[её]мся|начн[её]м)(?=[\s!?.:,]|$)/i;
const GENERIC_BODY_LINE = /^(?:известны два количества|сначала смотрим, сколько было|сначала находим второе количество|сначала узна(?:е|ё)м, сколько предметов в одинаковых группах|нужно оставить x отдельно)[.!?]?$/i;
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

function hasMathSignal(line) {
  return /\d|[xх]|[+\-=:×÷/]/i.test(String(line || ''));
}

function shortenBodyLine(line) {
  let text = String(line || '').trim();
  if (!text) return '';

  const replacements = [
    [/^Число\s+(.+?)\s+переносим\s+вправо[.!?]?$/i, (_, value) => `Переносим ${value} вправо`],
    [/^При\s+переносе\s+через\s+знак\s+равно\s+плюс\s+меняется\s+на\s+минус[.!?]?$/i, () => 'Плюс меняем на минус'],
    [/^При\s+переносе\s+через\s+знак\s+равно\s+минус\s+меняется\s+на\s+плюс[.!?]?$/i, () => 'Минус меняем на плюс'],
    [/^При\s+переносе\s+через\s+знак\s+равно\s+умножение\s+меняется\s+на\s+деление[.!?]?$/i, () => 'Умножение меняем на деление'],
    [/^При\s+переносе\s+через\s+знак\s+равно\s+деление\s+меняется\s+на\s+умножение[.!?]?$/i, () => 'Деление меняем на умножение'],
    [/^Нужно\s+узнать,\s+сколько\s+получится\s+вместе:\s*(.+)$/i, (_, expr) => `Вместе: ${expr.trim()}`],
    [/^Потом\s+узна(?:е|ё)м,\s+сколько\s+убрали:\s*(.+)$/i, (_, value) => `Убрали: ${value.trim()}`],
    [/^Нужно\s+узнать\s+разницу\s+между\s+двумя\s+числами[.!?]?$/i, () => 'Сравниваем два числа'],
    [/^Чтобы\s+узнать,\s+сколько\s+всего,\s+используем\s+умножение[.!?]?$/i, () => ''],
    [/^Чтобы\s+узнать,\s+сколько\s+было\s+сначала,\s+нужно\s+сложить[.!?]?$/i, () => ''],
    [/^Чтобы\s+узнать,\s+сколько\s+было\s+сначала,\s+нужно\s+вычесть\s+добавленное[.!?]?$/i, () => '']
  ];

  for (const [pattern, replacer] of replacements) {
    if (pattern.test(text)) {
      text = text.replace(pattern, replacer).trim();
      break;
    }
  }

  return text;
}

function compactBodyLines(lines, hasCheck) {
  const raw = [];
  const seen = new Set();

  lines.forEach(line => {
    const cleaned = shortenBodyLine(line);
    if (!cleaned) return;
    const key = cleaned.toLowerCase().replace(/[.!?]+$/g, '');
    if (seen.has(key)) return;
    seen.add(key);
    raw.push(cleaned);
  });

  const informativeExists = raw.some(hasMathSignal);
  const normalized = raw.filter(line => !(informativeExists && GENERIC_BODY_LINE.test(line)));
  const body = normalized.length ? normalized : raw;
  const maxBodyLines = hasCheck ? 5 : 6;

  return body.slice(0, maxBodyLines);
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

  const parsedLines = prepared
    .split(/\n+/)
    .map(line => line.trim())
    .filter(Boolean)
    .filter(line => !OPENERS_TO_REMOVE.test(line))
    .map(normalizeSectionLabel)
    .map(line => line.replace(/^Совет:\s*Совет:\s*/i, 'Совет: '))
    .map(line => line.replace(/^Ответ:\s*Ответ:\s*/i, 'Ответ: '))
    .map(line => line.replace(/^Проверка:\s*Проверка:\s*/i, 'Проверка: '));

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
      if (!checkLine) checkLine = line;
      return;
    }
    bodyLines.push(line);
  });

  const compactBody = compactBodyLines(bodyLines, Boolean(checkLine));

  if (!answerLine && compactBody.length) {
    const tail = compactBody[compactBody.length - 1];
    const match = tail.match(/=\s*([^=]+)$/);
    if (match?.[1]) {
      answerLine = `Ответ: ${match[1].trim()}`;
    }
  }

  if (!answerLine) answerLine = 'Ответ: проверь запись задачи';
  return [...compactBody, ...(checkLine ? [checkLine] : []), answerLine, ...(adviceLine ? [adviceLine] : [])].join('\n').trim();
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
