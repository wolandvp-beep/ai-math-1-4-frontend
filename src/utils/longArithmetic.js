import { escapeHtml } from './text.js';

function normalizeInput(text) {
  return String(text || '')
    .replace(/−/g, '-')
    .replace(/—/g, '-')
    .replace(/[xхXХ]/g, '×')
    .replace(/\*/g, '×')
    .replace(/÷/g, ':')
    .replace(/\//g, ':')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseInteger(value) {
  const normalized = String(value || '').replace(/\s+/g, '');
  if (!/^-?\d+$/.test(normalized)) return null;
  return Number(normalized);
}

export function parseLongArithmeticTask(text) {
  const normalized = normalizeInput(text);
  const match = normalized.match(/(-?\d[\d\s]*)\s*([+\-×:])\s*(-?\d[\d\s]*)/);
  if (!match) return null;

  const left = parseInteger(match[1]);
  const right = parseInteger(match[3]);
  const operator = match[2];

  if (!Number.isInteger(left) || !Number.isInteger(right)) return null;
  if (operator === ':' && right === 0) return null;

  return { left, right, operator, expression: `${left} ${operator} ${right}` };
}

function digitsOf(value) {
  return String(Math.abs(value)).split('');
}

function padLeft(arr, size, fill = '') {
  const copy = Array.isArray(arr) ? [...arr] : String(arr).split('');
  while (copy.length < size) copy.unshift(fill);
  return copy;
}

function renderGridRow(cells, extraClass = '') {
  return `<div class="column-row ${extraClass}">${cells.map(cell => `<span class="column-cell${cell.className ? ` ${cell.className}` : ''}">${escapeHtml(cell.value ?? '')}</span>`).join('')}</div>`;
}

function buildAdditionModel(left, right) {
  const result = left + right;
  const a = digitsOf(left);
  const b = digitsOf(right);
  const r = digitsOf(result);
  const maxDigits = Math.max(a.length, b.length, r.length);

  const carries = new Array(maxDigits).fill('');
  let carry = 0;
  for (let i = 0; i < maxDigits; i += 1) {
    const ai = Number(a[a.length - 1 - i] || 0);
    const bi = Number(b[b.length - 1 - i] || 0);
    const sum = ai + bi + carry;
    carry = sum >= 10 ? 1 : 0;
    if (carry && i + 1 < maxDigits) carries[maxDigits - 1 - (i + 1)] = '1';
  }

  return {
    type: 'addition',
    operator: '+',
    result,
    cols: maxDigits + 1,
    rows: [
      renderGridRow([{ value: '' }, ...carries.map(value => ({ value, className: 'carry-cell' }))], 'carry-row'),
      renderGridRow([{ value: '' }, ...padLeft(a, maxDigits).map(value => ({ value }))]),
      renderGridRow([{ value: '+' , className: 'operation-cell' }, ...padLeft(b, maxDigits).map(value => ({ value }))]),
      renderGridRow(new Array(maxDigits + 1).fill({ value: '' }), 'line-row'),
      renderGridRow([{ value: '' }, ...padLeft(r, maxDigits).map(value => ({ value, className: 'answer-cell' }))], 'answer-row')
    ],
    note: 'Складываем справа налево. Если сумма в разряде больше 9, единицу переносим в следующий разряд.'
  };
}

function buildSubtractionModel(left, right) {
  const result = left - right;
  const a = digitsOf(left);
  const b = digitsOf(right);
  const r = digitsOf(result);
  const maxDigits = Math.max(a.length, b.length, r.length);
  const top = padLeft(a, maxDigits, '0');
  const bottom = padLeft(b, maxDigits, '0');
  const borrowMarks = new Array(maxDigits).fill('');
  const working = top.map(Number);

  for (let i = maxDigits - 1; i >= 0; i -= 1) {
    if (working[i] < Number(bottom[i])) {
      let borrowIndex = i - 1;
      while (borrowIndex >= 0 && working[borrowIndex] === 0) {
        working[borrowIndex] = 9;
        borrowMarks[borrowIndex] = '9';
        borrowIndex -= 1;
      }
      if (borrowIndex >= 0) {
        working[borrowIndex] -= 1;
        borrowMarks[borrowIndex] = String(working[borrowIndex]);
        working[i] += 10;
      }
    }
  }

  return {
    type: 'subtraction',
    operator: '-',
    result,
    cols: maxDigits + 1,
    rows: [
      renderGridRow([{ value: '' }, ...borrowMarks.map(value => ({ value, className: 'carry-cell' }))], 'carry-row'),
      renderGridRow([{ value: '' }, ...padLeft(a, maxDigits).map(value => ({ value }))]),
      renderGridRow([{ value: '-' , className: 'operation-cell' }, ...padLeft(b, maxDigits).map(value => ({ value }))]),
      renderGridRow(new Array(maxDigits + 1).fill({ value: '' }), 'line-row'),
      renderGridRow([{ value: result < 0 ? '-' : '' }, ...padLeft(digitsOf(result), maxDigits).map(value => ({ value, className: 'answer-cell' }))], 'answer-row')
    ],
    note: 'Вычитаем справа налево. Если сверху цифра меньше, занимаем десяток у соседнего разряда слева.'
  };
}

function buildMultiplicationModel(left, right) {
  const result = left * right;
  const a = digitsOf(left);
  const b = digitsOf(right);
  const partials = [];

  String(Math.abs(right)).split('').reverse().forEach((digit, index) => {
    const partial = left * Number(digit);
    partials.push({
      value: partial,
      shift: index,
      digits: [...digitsOf(partial), ...new Array(index).fill('0')]
    });
  });

  const maxDigits = Math.max(
    a.length,
    b.length,
    digitsOf(result).length,
    ...partials.map(item => item.digits.length)
  );

  const rows = [
    renderGridRow([{ value: '' }, ...padLeft(a, maxDigits).map(value => ({ value }))]),
    renderGridRow([{ value: '×', className: 'operation-cell' }, ...padLeft(b, maxDigits).map(value => ({ value }))]),
    renderGridRow(new Array(maxDigits + 1).fill({ value: '' }), 'line-row')
  ];

  partials.forEach(item => {
    rows.push(renderGridRow([{ value: '' }, ...padLeft(item.digits, maxDigits).map(value => ({ value }))], 'partial-row'));
  });

  if (partials.length > 1) {
    rows.push(renderGridRow(new Array(maxDigits + 1).fill({ value: '' }), 'line-row'));
  }

  rows.push(renderGridRow([{ value: '' }, ...padLeft(digitsOf(result), maxDigits).map(value => ({ value, className: 'answer-cell' }))], 'answer-row'));

  return {
    type: 'multiplication',
    operator: '×',
    result,
    cols: maxDigits + 1,
    rows,
    note: 'Умножаем верхнее число на каждую цифру нижнего справа налево. Частичные результаты сдвигаем по разрядам и потом складываем.'
  };
}

function buildDivisionRows(dividend, divisor) {
  const quotientDigits = [];
  const workRows = [];
  let current = 0;
  let started = false;

  for (const digitChar of String(Math.abs(dividend))) {
    current = current * 10 + Number(digitChar);
    if (!started && current < divisor) {
      quotientDigits.push('0');
      workRows.push({ current, subtract: 0, remainder: current });
      continue;
    }

    started = true;
    const q = Math.floor(current / divisor);
    const subtract = q * divisor;
    const remainder = current - subtract;
    quotientDigits.push(String(q));
    workRows.push({ current, subtract, remainder });
    current = remainder;
  }

  const quotient = Number(quotientDigits.join(''));
  return { quotient, remainder: current, workRows };
}

function buildDivisionModel(left, right) {
  const { quotient, remainder, workRows } = buildDivisionRows(left, right);
  const leftWidth = Math.max(String(left).length, ...workRows.flatMap(item => [String(item.current).length, String(item.subtract).length, String(item.remainder).length]));

  return {
    type: 'division',
    operator: ':',
    result: remainder ? `${quotient} (ост. ${remainder})` : quotient,
    quotient,
    divisor: right,
    dividend: left,
    remainder,
    leftWidth,
    workRows,
    note: 'Слева по шагам берём часть делимого, которая уже делится на делитель. Сверху записываем цифры частного, затем вычитаем произведение и сносим следующую цифру.'
  };
}

export function createLongArithmeticModel(taskText) {
  const parsed = parseLongArithmeticTask(taskText);
  if (!parsed) return null;

  const { left, right, operator } = parsed;
  if (operator === '+') return buildAdditionModel(left, right);
  if (operator === '-') return buildSubtractionModel(left, right);
  if (operator === '×') return buildMultiplicationModel(left, right);
  if (operator === ':') return buildDivisionModel(left, right);
  return null;
}

function renderTextAsParagraphs(text) {
  return String(text || '')
    .split(/\n{2,}/)
    .map(block => block.trim())
    .filter(Boolean)
    .map(block => `<p>${escapeHtml(block).replace(/\n/g, '<br>')}</p>`)
    .join('');
}

function renderDivisionBoard(model) {
  const rowsHtml = model.workRows.map((row, index) => {
    const isActive = row.subtract > 0;
    return `
      <div class="division-step${isActive ? ' is-active' : ''}" style="--left-cols:${model.leftWidth}">
        <div class="division-current">${escapeHtml(String(row.current))}</div>
        <div class="division-subtract">${row.subtract ? escapeHtml(String(row.subtract)) : '&nbsp;'}</div>
        <div class="division-underline"></div>
        <div class="division-remainder">${escapeHtml(String(row.remainder))}</div>
      </div>
    `;
  }).join('');

  return `
    <div class="division-layout">
      <div class="division-left">
        <div class="division-dividend">${escapeHtml(String(model.dividend))}</div>
        ${rowsHtml}
      </div>
      <div class="division-right">
        <div class="division-divisor">${escapeHtml(String(model.divisor))}</div>
        <div class="division-top-line"></div>
        <div class="division-quotient">${escapeHtml(String(model.quotient))}</div>
      </div>
    </div>
    ${model.remainder ? `<div class="column-note">Остаток: ${escapeHtml(String(model.remainder))}</div>` : ''}
  `;
}

function renderColumnBoard(model) {
  if (model.type === 'division') {
    return renderDivisionBoard(model);
  }

  return `
    <div class="column-board" style="--column-count:${model.cols}">
      ${model.rows.join('')}
    </div>
  `;
}

export function buildSolvePresentation(taskText, explanationText) {
  const model = createLongArithmeticModel(taskText);
  const lineSection = `
    <section class="explanation-section">
      <div class="explanation-label">Решение в строку</div>
      <div class="result-text">${renderTextAsParagraphs(explanationText || 'Здесь появится объяснение и ответ.')}</div>
    </section>
  `;

  if (!model) {
    return {
      html: lineSection,
      copyText: explanationText || '',
      voiceText: explanationText || ''
    };
  }

  const arithmeticSummary = `${taskText}\n\nРешение столбиком:\n${model.note}\nОтвет: ${model.result}.`;

  return {
    html: `
      ${lineSection}
      <section class="explanation-section column-section">
        <div class="explanation-label">Решение столбиком</div>
        <div class="column-wrapper">
          ${renderColumnBoard(model)}
        </div>
        <div class="column-note">${escapeHtml(model.note)}</div>
      </section>
    `,
    copyText: `${explanationText || ''}\n\n${arithmeticSummary}`.trim(),
    voiceText: explanationText || ''
  };
}
