export function speakText(text) {
  if (!window.speechSynthesis) return false;
  const cleaned = String(text || '').trim();
  if (!cleaned) return false;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(cleaned);
  utterance.lang = 'ru-RU';
  utterance.rate = 0.92;
  utterance.pitch = 1.0;
  window.speechSynthesis.speak(utterance);
  return true;
}
export function pauseSpeech() {
  if (!window.speechSynthesis) return false;
  if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
    window.speechSynthesis.pause();
    return true;
  }
  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
    return true;
  }
  return false;
}
export function stopSpeech() {
  if (!window.speechSynthesis) return false;
  window.speechSynthesis.cancel();
  return true;
}
