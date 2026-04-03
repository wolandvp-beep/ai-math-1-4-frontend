import { escapeHtml } from './text.js';

const OP_SYMBOL = {
  '+': '+',
  '-': '−',
  '*': '×',
  '/': '÷'
};

function normalizeText(text) {
  return String(text || '')
    .replace(/\r/g, '')
    .replace(/[−–—]/g, '-')
    .replace(/[×xх]/gi, '*')
    .replace(/[÷:]/g, '/')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeLine(line) {
  return String(line || '')
    .replace(/\r/g, '')
    .replace(/[−–—]/g, '-')
    .replace(/[×xх]/gi, '*')
    .replace(/[÷:]/g, '/')
    .trim();
}

function formatOperator(op) {
  return OP_SYMBOL[op] || op;
}

function isSafeIntegerString(value) {
  return /^-?\d+$/.test(String(value || '').trim());
}

function hasMultiDigitOperand(step) {
  return [step.a, step.b].some((value) => String(Math.abs(Number(value))).length >= 2);
}

function parseStepFromMatch(match, lineIndex) {
  const [, left, opRaw, right, result] = match;
  const op = opRaw === ':' ? '/' : opRaw;
  if (!['+', '-', '*', '/'].includes(op)) return null;
  if (![left, right, result].every(isSafeIntegerString)) return null;

  const a = Number(left);
  const b = Number(right);
  const c = Number(result);
  if (!Number.isSafeInteger(a) || !Number.isSafeInteger(b) || !Number.isSafeInteger(c)) return null;

  if (op === '+' && a + b !== c) return null;
  if (op === '-' && a - b !== c) return null;
  if (op === '*' && a * b !== c) return null;
  if (op === '/') {
    if (b === 0) return null;
    if (Math.trunc(a / b) !== c) return null;
  }

  return {
    id: `${lineIndex}:${a}:${op}:${b}:${c}`,
    lineIndex,
    a,
    b,
    result: c,
    op,
    source: `${a} ${formatOperator(op)} ${b} = ${c}`
  };
}

export function extractArithmeticSteps(text) {
  const lines = String(text || '').replace(/\r/g, '').split('\n');
  const steps = [];
  const seen = new Set();
  const pattern = /(-?\d+)\s*([+\-*/:])\s*(-?\d+)\s*=\s*(-?\d+)/g;

  lines.forEach((rawLine, lineIndex) => {
    const line = normalizeLine(rawLine);
    let match;
    while ((match = pattern.exec(line)) !== null) {
      const step = parseStepFromMatch(match, lineIndex);
      if (!step) continue;
      if (seen.has(step.id)) continue;
      seen.add(step.id);
      steps.push(step);
    }
  });

  return steps;
}

function renderTextExplanation(text) {
  const lines = String(text || '').replace(/\r/g, '').split('\n');
  return lines
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<p class="result-paragraph">${escapeHtml(line)}</p>`)
    .join('');
}

function digitsOf(value) {
  return String(Math.abs(value)).split('');
}

function padLeft(items, total, fill = '') {
  const diff = Math.max(0, total - items.length);
  return Array(diff).fill(fill).concat(items);
}

function renderCellRow(cells, options = {}) {
  const { operator = '', className = '' } = options;
  const rowClass = ['column-row', className].filter(Boolean).join(' ');
  return `
    <tr class="${rowClass}">
      <td class="column-op">${operator ? escapeHtml(operator) : ''}</td>
      ${cells.map((cell) => `<td class="column-cell">${cell ? escapeHtml(String(cell)) : ''}</td>`).join('')}
    </tr>
  `;
}

function renderAdditionSubtraction(step) {
  const topDigits = digitsOf(step.a);
  const bottomDigits = digitsOf(step.b);
  const resultDigits = digitsOf(step.result);
  const width = Math.max(topDigits.length, bottomDigits.length, resultDigits.length);
  const carry = Array(width).fill('');

  if (step.op === '+') {
    let carryValue = 0;
    for (let i = width - 1; i >= 0; i -= 1) {
      const left = Number(padLeft(topDigits, width)[i] || 0);
      const right = Number(padLeft(bottomDigits, width)[i] || 0);
      const sum = left + right + carryValue;
      carryValue = Math.floor(sum / 10);
      if (carryValue > 0 && i > 0) {
        carry[i - 1] = String(carryValue);
      }
    }
  }

  if (step.op === '-') {
    let borrow = 0;
    const top = padLeft(topDigits, width);
    const bottom = padLeft(bottomDigits, width);
    for (let i = width - 1; i >= 0; i -= 1) {
      const current = Number(top[i] || 0) - borrow;
      const sub = Number(bottom[i] || 0);
      if (current < sub && i > 0) {
        borrow = 1;
        carry[i - 1] = '−1';
      } else {
        borrow = 0;
      }
    }
  }

  return `
    <table class="column-table" aria-label="${escapeHtml(step.source)}">
      <tbody>
        ${renderCellRow(padLeft(carry, width), { className: 'column-carry-row' })}
        ${renderCellRow(padLeft(topDigits, width))}
        ${renderCellRow(padLeft(bottomDigits, width), { operator: formatOperator(step.op) })}
        ${renderCellRow(padLeft(resultDigits, width), { className: 'column-result-row' })}
      </tbody>
    </table>
  `;
}

function buildPartialProducts(a, b) {
  const multiplicand = Math.abs(a);
  const digits = String(Math.abs(b)).split('').reverse();
  return digits.map((digit, index) => ({
    value: multiplicand * Number(digit) * (10 ** index),
    shift: index,
    digit: Number(digit)
  }));
}

function renderMultiplication(step) {
  const topDigits = digitsOf(step.a);
  const bottomDigits = digitsOf(step.b);
  const partials = buildPartialProducts(step.a, step.b);
  const partialDigits = partials.map((item) => digitsOf(item.value));
  const width = Math.max(
    topDigits.length,
    bottomDigits.length,
    digitsOf(step.result).length,
    ...partialDigits.map((digits) => digits.length)
  );

  const partialRows = partials.map((item) => {
    const shiftedDigits = digitsOf(item.value).concat(Array(item.shift).fill(''));
    return renderCellRow(padLeft(shiftedDigits, width), {
      operator: item.shift === 0 ? '' : '+'
    });
  }).join('');

  return `
    <table class="column-table" aria-label="${escapeHtml(step.source)}">
      <tbody>
        ${renderCellRow(padLeft(topDigits, width))}
        ${renderCellRow(padLeft(bottomDigits, width), { operator: '×' })}
        ${partialRows}
        ${renderCellRow(padLeft(digitsOf(step.result), width), { className: 'column-result-row' })}
      </tbody>
    </table>
  `;
}

function buildDivisionSteps(dividend, divisor) {
  const digits = String(dividend).split('').map(Number);
  const steps = [];
  let current = 0;
  let currentText = '';

  digits.forEach((digit) => {
    current = current * 10 + digit;
    currentText += String(digit);
    if (current < divisor && steps.length === 0) return;
    if (current < divisor) {
      steps.push({
        partial: current,
        product: null,
        remainder: current,
        quotientDigit: 0
      });
      return;
    }

    const quotientDigit = Math.trunc(current / divisor);
    const product = quotientDigit * divisor;
    const remainder = current - product;
    steps.push({ partial: current, product, remainder, quotientDigit });
    current = remainder;
    currentText = remainder ? String(remainder) : '';
  });

  return steps;
}

function renderDivision(step) {
  const dividend = Math.abs(step.a);
  const divisor = Math.abs(step.b);
  const quotient = Math.trunc(dividend / divisor);
  const remainder = dividend % divisor;
  const steps = buildDivisionSteps(dividend, divisor);

  const body = steps.map((item) => {
    if (item.product == null) {
      return `
        <div class="division-step">
          <div class="division-step-top">${escapeHtml(String(item.partial))}</div>
          <div class="division-step-bottom"></div>
        </div>
      `;
    }

    return `
      <div class="division-step">
        <div class="division-step-top">${escapeHtml(String(item.partial))}</div>
        <div class="division-step-bottom">− ${escapeHtml(String(item.product))}</div>
        <div class="division-step-rem">${escapeHtml(String(item.remainder))}</div>
      </div>
    `;
  }).join('');

  return `
    <div class="division-layout" aria-label="${escapeHtml(step.source)}">
      <div class="division-header">
        <div class="division-left">${escapeHtml(String(divisor))}</div>
        <div class="division-right">
          <div class="division-quotient">${escapeHtml(String(quotient))}</div>
          <div class="division-dividend">${escapeHtml(String(dividend))}</div>
        </div>
      </div>
      <div class="division-steps">${body}</div>
      <div class="division-footer">Остаток: ${escapeHtml(String(remainder))}</div>
    </div>
  `;
}

function renderColumn(step) {
  if (step.op === '+' || step.op === '-') return renderAdditionSubtraction(step);
  if (step.op === '*') return renderMultiplication(step);
  if (step.op === '/') return renderDivision(step);
  return '';
}

function renderMathCards(steps) {
  const visualSteps = steps.filter(hasMultiDigitOperand);
  if (!visualSteps.length) return '';

  return `
    <section class="math-visual-section" aria-label="Вычисления">
      <div class="math-visual-title">Вычисления в строку и в столбик</div>
      <div class="math-visual-list">
        ${visualSteps.map((step) => `
          <article class="math-card">
            <div class="math-inline">${escapeHtml(step.source)}</div>
            <div class="math-column-wrap">${renderColumn(step)}</div>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

function maybeAddDirectTaskStep(steps, taskText) {
  const normalized = normalizeText(taskText);
  const directPattern = /(?:^|(?:пример|вычисли|реши|сколько будет)\s*:?\s*)(-?\d+)\s*([+\-*/])\s*(-?\d+)$/i;
  const match = normalized.match(directPattern);
  if (!match) return steps;

  const [, left, op, right] = match;
  if (![left, right].every(isSafeIntegerString)) return steps;

  const a = Number(left);
  const b = Number(right);
  if (!Number.isSafeInteger(a) || !Number.isSafeInteger(b)) return steps;
  if (op === '/' && b === 0) return steps;

  const result = op === '+' ? a + b : op === '-' ? a - b : op === '*' ? a * b : Math.trunc(a / b);
  const step = { id: `task:${a}:${op}:${b}:${result}`, lineIndex: -1, a, b, result, op, source: `${a} ${formatOperator(op)} ${b} = ${result}` };
  if (!steps.some((item) => item.id === step.id)) steps.unshift(step);
  return steps;
}

export function renderStructuredExplanation(resultText, taskText = '') {
  const steps = maybeAddDirectTaskStep(extractArithmeticSteps(resultText), taskText);
  const explanationHtml = renderTextExplanation(resultText);
  const visualsHtml = renderMathCards(steps);

  return `
    <div class="result-text-block">${explanationHtml || '<p class="result-placeholder">Здесь появится объяснение и ответ.</p>'}</div>
    ${visualsHtml}
  `;
}
