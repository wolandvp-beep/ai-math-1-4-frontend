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
  return String(str).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}
