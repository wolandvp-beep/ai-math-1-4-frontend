import { splitExplanationLines } from './text.js';

function getSynth() {
  return typeof window !== 'undefined' ? window.speechSynthesis : null;
}

let currentUtterance = null;
let currentSessionId = 0;
let currentQueue = [];
let currentHandlers = null;
let hasStartedCurrentSession = false;

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
  currentQueue = [];
  currentHandlers = null;
  hasStartedCurrentSession = false;
}

function emitToCurrent(handlers, eventName, value) {
  const handler = handlers && typeof handlers[eventName] === 'function' ? handlers[eventName] : null;
  if (!handler) return;

  if (typeof value === 'undefined') {
    handler();
    return;
  }

  handler(value);
}

function stopCurrentSpeech() {
  const synth = getSynth();
  currentSessionId += 1;
  currentUtterance = null;
  currentQueue = [];
  currentHandlers = null;
  hasStartedCurrentSession = false;

  try {
    synth?.cancel();
  } catch {}
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

function escapeForRegex(value) {
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function replaceTokenForSpeech(text, token, spoken) {
  const pattern = new RegExp(`(^|[^\\p{L}\\p{N}_])${escapeForRegex(token)}(?=[^\\p{L}\\p{N}_]|$)`, 'gu');
  return String(text || '').replace(pattern, `$1${spoken}`);
}

function normalizeUnitsForSpeech(text) {
  let normalized = String(text || '');
  const replacements = [
    ['мм²', ' квадратных миллиметров '],
    ['см²', ' квадратных сантиметров '],
    ['дм²', ' квадратных дециметров '],
    ['м²', ' квадратных метров '],
    ['км²', ' квадратных километров '],
    ['мм', ' миллиметров '],
    ['см', ' сантиметров '],
    ['дм', ' дециметров '],
    ['км', ' километров '],
    ['м', ' метров ']
  ];

  replacements.forEach(([token, spoken]) => {
    normalized = replaceTokenForSpeech(normalized, token, spoken);
  });

  normalized = normalized.replace(/²/g, ' в квадрате ');
  return normalized;
}

function normalizeMathForSpeech(text) {
  let normalized = String(text || '').trim();

  normalized = normalizeVariableX(normalized);
  normalized = replaceSlashExpressions(normalized);
  normalized = normalizeUnitsForSpeech(normalized);
  normalized = normalized.replace(/(\b\d+\b|икс|\)|\])\s*:\s*(\b\d+\b|икс|\(|\[)/g, '$1 делить на $2');

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

function speakQueueLine(sessionId, lineIndex) {
  const synth = getSynth();
  if (!synth || sessionId !== currentSessionId) return false;

  const line = currentQueue[lineIndex];
  if (!line) {
    const handlers = currentHandlers;
    emitToCurrent(handlers, 'onLineChange', -1);
    resetIfCurrent(sessionId);
    emitToCurrent(handlers, 'onEnd');
    return true;
  }

  const handlers = currentHandlers;
  const safeText = normalizeMathForSpeech(line);
  if (!safeText) {
    return speakQueueLine(sessionId, lineIndex + 1);
  }

  emitToCurrent(handlers, 'onLineChange', lineIndex);
  const utterance = new SpeechSynthesisUtterance(safeText);
  utterance.lang = 'ru-RU';
  utterance.rate = 0.9;
  utterance.pitch = 0.98;
  utterance.onstart = () => {
    if (!hasStartedCurrentSession && sessionId === currentSessionId) {
      hasStartedCurrentSession = true;
      emitToCurrent(handlers, 'onStart');
    }
  };
  utterance.onpause = () => emitToCurrent(handlers, 'onPause');
  utterance.onresume = () => emitToCurrent(handlers, 'onResume');
  utterance.onerror = () => {
    if (sessionId !== currentSessionId) return;
    emitToCurrent(handlers, 'onLineChange', -1);
    resetIfCurrent(sessionId);
    emitToCurrent(handlers, 'onEnd');
  };
  utterance.onend = () => {
    if (sessionId !== currentSessionId) return;
    currentUtterance = null;
    speakQueueLine(sessionId, lineIndex + 1);
  };

  try {
    currentUtterance = utterance;
    synth.speak(utterance);
    return true;
  } catch {
    emitToCurrent(handlers, 'onLineChange', -1);
    resetIfCurrent(sessionId);
    emitToCurrent(handlers, 'onEnd');
    return false;
  }
}

export function speakText(text, handlers = {}) {
  const synth = getSynth();
  const queue = splitExplanationLines(text)
    .map(line => line.trim())
    .filter(Boolean);

  if (!synth || !queue.length) return false;

  stopCurrentSpeech();
  const sessionId = currentSessionId;
  currentQueue = queue;
  currentHandlers = handlers;
  hasStartedCurrentSession = false;

  try {
    synth.resume();
  } catch {}

  return speakQueueLine(sessionId, 0);
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
