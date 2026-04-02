function getSynth() {
  return typeof window !== 'undefined' ? window.speechSynthesis : null;
}

let currentUtterance = null;

export function speakText(text, handlers = {}) {
  const synth = getSynth();
  const safeText = String(text || '').trim();
  if (!synth || !safeText) return false;

  const onStart = typeof handlers.onStart === 'function' ? handlers.onStart : null;
  const onEnd = typeof handlers.onEnd === 'function' ? handlers.onEnd : null;
  const onPause = typeof handlers.onPause === 'function' ? handlers.onPause : null;
  const onResume = typeof handlers.onResume === 'function' ? handlers.onResume : null;

  const utterance = new SpeechSynthesisUtterance(safeText);
  utterance.lang = 'ru-RU';
  utterance.rate = 0.9;
  utterance.pitch = 0.98;
  utterance.onstart = () => onStart?.();
  utterance.onend = () => {
    currentUtterance = null;
    onEnd?.();
  };
  utterance.onerror = () => {
    currentUtterance = null;
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
    currentUtterance = null;
    return false;
  }
}

export function togglePauseSpeech(handlers = {}) {
  const synth = getSynth();
  if (!synth || !currentUtterance) return false;

  const onPause = typeof handlers.onPause === 'function' ? handlers.onPause : null;
  const onResume = typeof handlers.onResume === 'function' ? handlers.onResume : null;

  try {
    if (synth.paused) {
      synth.resume();
      onResume?.();
      return 'resumed';
    }
    if (synth.speaking) {
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
    hasActiveUtterance: Boolean(currentUtterance)
  };
}
