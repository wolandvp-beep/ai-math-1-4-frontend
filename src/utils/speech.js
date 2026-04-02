function getSynth() {
  return typeof window !== 'undefined' ? window.speechSynthesis : null;
}

export function speakText(text) {
  const synth = getSynth();
  const safeText = String(text || '').trim();
  if (!synth || !safeText) return false;

  const utterance = new SpeechSynthesisUtterance(safeText);
  utterance.lang = 'ru-RU';
  utterance.rate = 0.9;
  utterance.pitch = 0.98;

  try {
    if (synth.speaking || synth.pending) synth.cancel();
    synth.resume();
    synth.speak(utterance);
    return true;
  } catch {
    return false;
  }
}

export function pauseSpeech() {
  const synth = getSynth();
  if (!synth || !synth.speaking || synth.paused) return false;

  try {
    synth.pause();
    return true;
  } catch {
    return false;
  }
}

export function stopSpeech() {
  const synth = getSynth();
  if (!synth || (!synth.speaking && !synth.pending && !synth.paused)) return false;

  try {
    synth.cancel();
    return true;
  } catch {
    return false;
  }
}
