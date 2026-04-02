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
  return String(str).replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]));
}


export function escapeAttribute(str) {
  return escapeHtml(str).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

export function formatExplanationSections(text) {
  const raw = String(text || '').trim();
  if (!raw) {
    return {
      explanation: '',
      answer: '',
      answerLabel: 'Ответ',
      hasStructuredAnswer: false
    };
  }

  const lines = raw.split(/
+/).map(line => line.trim()).filter(Boolean);
  const answerIndex = lines.findIndex(line => /^(ответ|итог|получаем|значит)\s*[:—-]?/i.test(line));

  if (answerIndex >= 0) {
    const explanationLines = lines.slice(0, answerIndex);
    const answerLine = lines[answerIndex].replace(/^(ответ|итог|получаем|значит)\s*[:—-]?\s*/i, '').trim();
    const trailing = lines.slice(answerIndex + 1);
    return {
      explanation: explanationLines.join('

'),
      answer: [answerLine, ...trailing].filter(Boolean).join(' '),
      answerLabel: 'Ответ',
      hasStructuredAnswer: true
    };
  }

  if (lines.length >= 3) {
    return {
      explanation: lines.slice(0, -1).join('

'),
      answer: lines.at(-1),
      answerLabel: 'Короткий итог',
      hasStructuredAnswer: true
    };
  }

  return {
    explanation: raw,
    answer: '',
    answerLabel: 'Ответ',
    hasStructuredAnswer: false
  };
}

export function summarizeHistoryResult(text, maxLen = 120) {
  const normalized = String(text || '').replace(/\s+/g, ' ').trim();
  if (!normalized) return '';
  return normalized.length > maxLen ? normalized.slice(0, maxLen).trimEnd() + '…' : normalized;
}

export function detectTaskKind(text) {
  const source = String(text || '').toLowerCase();
  if (!source.trim()) return 'Задача';
  if (/x|y|=/.test(source)) return 'Уравнение';
  if (/дроб|\//.test(source)) return 'Дроби';
  if (/периметр|площад|геометр|см|м/.test(source)) return 'Геометрия';
  if (/\d\s*[+\-×x*÷:]\s*\d/.test(source)) return 'Пример';
  return 'Задача';
}
