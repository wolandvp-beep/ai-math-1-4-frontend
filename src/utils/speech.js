let currentUtterance = null;
let paused = false;

export function speakText(text) {
  if (!window.speechSynthesis) return false;
  const prepared = String(text || '').trim();
  if (!prepared) return false;

  if (window.speechSynthesis.speaking && paused) {
    window.speechSynthesis.resume();
    paused = false;
    return 'resumed';
  }

  window.speechSynthesis.cancel();
  currentUtterance = new SpeechSynthesisUtterance(prepared);
  currentUtterance.lang = 'ru-RU';
  currentUtterance.rate = 0.9;
  currentUtterance.pitch = 0.98;
  currentUtterance.onend = () => { paused = false; currentUtterance = null; };
  paused = false;
  window.speechSynthesis.speak(currentUtterance);
  return 'started';
}

export function pauseSpeech() {
  if (!window.speechSynthesis) return false;
  if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
    window.speechSynthesis.pause();
    paused = true;
    return true;
  }
  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
    paused = false;
    return true;
  }
  return false;
}

export function stopSpeech() {
  if (!window.speechSynthesis) return false;
  window.speechSynthesis.cancel();
  currentUtterance = null;
  paused = false;
  return true;
}
