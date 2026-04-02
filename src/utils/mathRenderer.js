import { escapeHtml } from './text.js';

function asArray(value) {
  return Array.isArray(value) ? value.filter(Boolean).map(v => String(v)) : [];
}

export function createPlainTextFromPayload(payload, fallbackText = '') {
  if (!payload || typeof payload === 'string') {
    return String(fallbackText || payload || '').trim();
  }

  const parts = [];
  if (payload.inline_expression) parts.push(String(payload.inline_expression).trim());

  const columnLines = asArray(payload.column_lines);
  if (columnLines.length) parts.push(columnLines.join('\n'));

  if (payload.division) {
    const divisionText = [
      `${payload.division.dividend} : ${payload.division.divisor} = ${payload.division.quotient}`,
      ...asArray(payload.division.text_lines)
    ].filter(Boolean).join('\n');
    if (divisionText) parts.push(divisionText);
  }

  const explanation = asArray(payload.explanation_lines);
  if (explanation.length) parts.push(explanation.join('\n'));

  if (payload.answer) parts.push(`Ответ: ${payload.answer}`);
  if (payload.advice) parts.push(`Совет: ${payload.advice}`);

  const text = parts.filter(Boolean).join('\n\n').trim();
  return text || String(fallbackText || '').trim();
}

function renderTextBlock(text) {
  return `<div class="result-text-only">${escapeHtml(text || '').replace(/\n/g, '<br>')}</div>`;
}

function buildCharGrid(lines) {
  const safeLines = lines.map(line => String(line));
  const cols = Math.max(...safeLines.map(line => line.length), 1);
  const items = [];

  safeLines.forEach((line, rowIndex) => {
    Array.from(line).forEach((char, charIndex) => {
      if (char === ' ') return;
      items.push(`<span class="math-grid-char" style="grid-column:${charIndex + 1};grid-row:${rowIndex + 1};">${escapeHtml(char)}</span>`);
    });
  });

  return `
    <div class="math-grid-block">
      <div class="math-grid" style="--math-cols:${cols};--math-rows:${safeLines.length};">
        ${items.join('')}
      </div>
    </div>
  `;
}

function buildDivisionGrid(division) {
  const dividend = String(division?.dividend || '');
  const divisor = String(division?.divisor || '');
  const quotient = String(division?.quotient || '');
  const steps = Array.isArray(division?.steps) ? division.steps : [];
  const leftStart = 2;
  const dividendLen = dividend.length;
  const dividerCol = leftStart + dividendLen + 1;
  const rightStart = dividerCol + 1;
  const rightWidth = Math.max(divisor.length, quotient.length, 3) + 1;
  const cols = rightStart + rightWidth + 1;
  const items = [];
  const lines = [];

  Array.from(dividend).forEach((char, index) => {
    items.push(`<span class="math-grid-char" style="grid-column:${leftStart + index};grid-row:1;">${escapeHtml(char)}</span>`);
  });

  Array.from(divisor).forEach((char, index) => {
    items.push(`<span class="math-grid-char" style="grid-column:${rightStart + index};grid-row:1;">${escapeHtml(char)}</span>`);
  });

  Array.from(quotient).forEach((char, index) => {
    items.push(`<span class="math-grid-char" style="grid-column:${rightStart + index};grid-row:2;">${escapeHtml(char)}</span>`);
  });

  lines.push(`<span class="math-grid-vline" style="grid-column:${dividerCol};grid-row:1 / span 2;"></span>`);
  lines.push(`<span class="math-grid-hline" style="grid-column:${dividerCol};grid-row:1;grid-column-end:${rightStart + rightWidth};"></span>`);

  let row = 3;

  steps.forEach((step, index) => {
    const position = Number(step?.position || (index + 1));
    const subtract = String(step?.subtract || '');
    const nextPartial = step?.next_partial != null ? String(step.next_partial) : '';
    const remainder = step?.remainder != null ? String(step.remainder) : '';
    const endCol = leftStart + Math.max(position - 1, 0);
    const subtractStart = endCol - subtract.length + 1;

    items.push(`<span class="math-grid-char" style="grid-column:${subtractStart - 1};grid-row:${row};">−</span>`);
    Array.from(subtract).forEach((char, idx) => {
      items.push(`<span class="math-grid-char" style="grid-column:${subtractStart + idx};grid-row:${row};">${escapeHtml(char)}</span>`);
    });
    lines.push(`<span class="math-grid-hline" style="grid-column:${subtractStart};grid-row:${row + 1};grid-column-end:${endCol + 1};"></span>`);

    const afterText = index < steps.length - 1 && nextPartial ? nextPartial : remainder;
    if (afterText) {
      const nextPosition = index < steps.length - 1 ? Number(steps[index + 1]?.position || position) : dividendLen;
      const afterEndCol = leftStart + Math.max(nextPosition - 1, position - 1);
      const afterStart = afterEndCol - String(afterText).length + 1;
      Array.from(String(afterText)).forEach((char, idx) => {
        items.push(`<span class="math-grid-char" style="grid-column:${afterStart + idx};grid-row:${row + 2};">${escapeHtml(char)}</span>`);
      });
    }

    row += 3;
  });

  const totalRows = Math.max(row, 5);

  return `
    <div class="math-grid-block math-grid-division-wrap">
      <div class="math-grid math-grid-division" style="--math-cols:${cols};--math-rows:${totalRows};">
        ${lines.join('')}
        ${items.join('')}
      </div>
    </div>
  `;
}

export function renderMathResult(payload, fallbackText = '') {
  if (!payload || typeof payload === 'string') {
    return renderTextBlock(fallbackText || payload || '');
  }

  const inlineExpression = payload.inline_expression ? `
    <div class="math-inline-expression">${escapeHtml(payload.inline_expression)}</div>
  ` : '';

  const columnLines = asArray(payload.column_lines);
  const columnBlock = columnLines.length ? `
    <div class="math-section">
      <div class="math-section-label">Решение столбиком</div>
      ${buildCharGrid(columnLines)}
    </div>
  ` : '';

  const divisionBlock = payload.division ? `
    <div class="math-section">
      <div class="math-section-label">Решение уголком</div>
      ${buildDivisionGrid(payload.division)}
    </div>
  ` : '';

  const explanation = asArray(payload.explanation_lines).map(line => `<p class="math-explanation-line">${escapeHtml(line)}</p>`).join('');
  const answer = payload.answer ? `<div class="math-answer">Ответ: ${escapeHtml(payload.answer)}</div>` : '';
  const advice = payload.advice ? `<div class="math-advice">Совет: ${escapeHtml(payload.advice)}</div>` : '';

  return `
    <div class="math-result-view">
      ${inlineExpression}
      ${columnBlock}
      ${divisionBlock}
      <div class="math-section">
        <div class="math-section-label">Объяснение</div>
        <div class="math-explanation">${explanation || renderTextBlock(fallbackText)}</div>
      </div>
      ${answer}
      ${advice}
    </div>
  `;
}
