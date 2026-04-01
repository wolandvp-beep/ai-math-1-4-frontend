export function speakText(text) {
  if (!window.speechSynthesis) return false;
  const utterance = new SpeechSynthesisUtterance(String(text || '').trim());
  if (!utterance.text) return false;
  utterance.lang = 'ru-RU';
  utterance.rate = 0.9;
  utterance.pitch = 0.98;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
  return true;
}

export function pauseSpeech() {
  if (!window.speechSynthesis || !window.speechSynthesis.speaking) return false;
  window.speechSynthesis.pause();
  return true;
}

export function stopSpeech() {
  if (!window.speechSynthesis) return false;
  window.speechSynthesis.cancel();
  return true;
}
