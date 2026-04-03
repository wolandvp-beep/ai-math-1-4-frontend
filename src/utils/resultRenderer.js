import { buildColumnSolution } from './columnMath.js';
import { escapeHtml } from './text.js';

function renderParagraphs(text) {
  const lines = String(text || '')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);

  if (!lines.length) {
    return '<p class="result-line muted">Здесь появится объяснение и ответ.</p>';
  }

  return lines
    .map(line => `<p class="result-line">${escapeHtml(line)}</p>`)
    .join('');
}

export function renderExplanationResult({ taskText, explanationText }) {
  const columnSolution = buildColumnSolution(taskText);
  const explanationHtml = renderParagraphs(explanationText);
  const copyText = columnSolution
    ? `${String(explanationText || '').trim()}\n\n${columnSolution.inlineTitle}:\n${columnSolution.inlineText}`.trim()
    : String(explanationText || '').trim();

  const html = `
    <div class="explanation-copy">
      <div class="explanation-block">
        ${explanationHtml}
      </div>
      ${columnSolution ? `
        <div class="math-methods">
          <section class="math-method-card">
            <div class="math-method-title">${escapeHtml(columnSolution.inlineTitle)}</div>
            <div class="math-inline-box">${escapeHtml(columnSolution.inlineText)}</div>
          </section>
          <section class="math-method-card">
            <div class="math-method-title">${escapeHtml(columnSolution.title)}</div>
            ${columnSolution.html}
          </section>
        </div>
      ` : ''}
    </div>
  `;

  return { html, copyText };
}
