function getSynth() {
  return typeof window !== 'undefined' ? window.speechSynthesis : null;
}

let currentUtterance = null;
let currentSessionId = 0;

const SIMPLE_FRACTION_NAMES = new Map([
  ['1/2', 'одна вторая'],
  ['1/3', 'одна треть'],
  ['1/4', 'одна четвёртая'],
  ['1/5', 'одна пятая'],
  ['1/6', 'одна шестая'],
  ['1/7', 'одна седьмая'],
  ['1/8', 'одна восьмая'],
  ['1/9', 'одна девятая'],
  ['1/10', 'одна десятая'],
  ['2/3', 'две третьих'],
  ['2/5', 'две пятых'],
  ['3/4', 'три четвёртых']
]);

function resetIfCurrent(sessionId) {
  if (sessionId !== currentSessionId) return;
  currentUtterance = null;
}

function normalizeVariableX(text) {
  return String(text || '').replace(/[xхXХ]/g, (match, offset, fullText) => {
    const before = offset > 0 ? fullText[offset - 1] : '';
    const after = offset < fullText.length - 1 ? fullText[offset + 1] : '';
    const beforeIsLetter = /[A-Za-zА-Яа-яЁё]/.test(before);
    const afterIsLetter = /[A-Za-zА-Яа-яЁё]/.test(after);

    if (beforeIsLetter || afterIsLetter) {
      return match;
    }

    const needsSpaceBefore = /[0-9)]/.test(before);
    const needsSpaceAfter = /[0-9(]/.test(after);

    return `${needsSpaceBefore ? ' ' : ''}икс${needsSpaceAfter ? ' ' : ''}`;
  });
}

function isSimpleFractionContext(fullText, matchStart, matchEnd) {
  const before = fullText.slice(Math.max(0, matchStart - 8), matchStart);
  const after = fullText.slice(matchEnd, Math.min(fullText.length, matchEnd + 8));

  if (/[=+\-×*><≤≥≠]/.test(before) || /[=+\-×*><≤≥≠]/.test(after)) {
    return false;
  }

  if (/\w\s*$/.test(before) || /^\s*\w/.test(after)) {
    return false;
  }

  return true;
}

function replaceSlashExpressions(text) {
  return text.replace(/\b(\d+)\s*\/\s*(\d+)\b/g, (match, left, right, offset, fullText) => {
    const normalizedKey = `${left}/${right}`;

    if (SIMPLE_FRACTION_NAMES.has(normalizedKey) && isSimpleFractionContext(fullText, offset, offset + match.length)) {
      return ` ${SIMPLE_FRACTION_NAMES.get(normalizedKey)} `;
    }

    return ` ${left} делить на ${right} `;
  });
}

function normalizeMathForSpeech(text) {
  let normalized = String(text || '')
    .replace(/\r\n/g, '\n')
    .replace(/\n/g, ' ')
    .trim();

  normalized = normalizeVariableX(normalized);
  normalized = replaceSlashExpressions(normalized);

  return normalized
    .replace(/\+/g, ' плюс ')
    .replace(/−|-/g, ' минус ')
    .replace(/×|\*/g, ' умножить на ')
    .replace(/=/g, ' равно ')
    .replace(/\//g, ' делить на ')
    .replace(/>/g, ' больше ')
    .replace(/</g, ' меньше ')
    .replace(/≥/g, ' больше или равно ')
    .replace(/≤/g, ' меньше или равно ')
    .replace(/≠/g, ' не равно ')
    .replace(/\(/g, ' скобка открывается ')
    .replace(/\)/g, ' скобка закрывается ')
    .replace(/%/g, ' процентов ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function speakText(text, handlers = {}) {
  const synth = getSynth();
  const safeText = normalizeMathForSpeech(text);
  if (!synth || !safeText) return false;

  const onStart = typeof handlers.onStart === 'function' ? handlers.onStart : null;
  const onEnd = typeof handlers.onEnd === 'function' ? handlers.onEnd : null;
  const onPause = typeof handlers.onPause === 'function' ? handlers.onPause : null;
  const onResume = typeof handlers.onResume === 'function' ? handlers.onResume : null;

  const sessionId = ++currentSessionId;
  const utterance = new SpeechSynthesisUtterance(safeText);
  utterance.lang = 'ru-RU';
  utterance.rate = 0.9;
  utterance.pitch = 0.98;
  utterance.onstart = () => onStart?.();
  utterance.onend = () => {
    resetIfCurrent(sessionId);
    onEnd?.();
  };
  utterance.onerror = () => {
    resetIfCurrent(sessionId);
    onEnd?.();
  };
  utterance.onpause = () => onPause?.();
  utterance.onresume = () => onResume?.();

  try {
    if (synth.speaking || synth.pending || synth.paused) synth.cancel();
    currentUtterance = utterance;
    synth.resume();
    synth.speak(utterance);
    return true;
  } catch {
    resetIfCurrent(sessionId);
    return false;
  }
}

export function togglePauseSpeech(handlers = {}) {
  const synth = getSynth();
  if (!synth) return false;

  const onPause = typeof handlers.onPause === 'function' ? handlers.onPause : null;
  const onResume = typeof handlers.onResume === 'function' ? handlers.onResume : null;

  const hasActiveSpeech = Boolean(currentUtterance) || Boolean(synth.speaking) || Boolean(synth.pending) || Boolean(synth.paused);
  if (!hasActiveSpeech) return false;

  try {
    if (synth.paused) {
      synth.resume();
      onResume?.();
      return 'resumed';
    }

    if (synth.speaking || synth.pending) {
      synth.pause();
      onPause?.();
      return 'paused';
    }

    return false;
  } catch {
    return false;
  }
}

export function getSpeechStatus() {
  const synth = getSynth();
  return {
    supported: Boolean(synth),
    speaking: Boolean(synth?.speaking),
    pending: Boolean(synth?.pending),
    paused: Boolean(synth?.paused),
    hasActiveUtterance: Boolean(currentUtterance) || Boolean(synth?.speaking) || Boolean(synth?.pending) || Boolean(synth?.paused)
  };
}
