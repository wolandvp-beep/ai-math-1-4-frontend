import { escapeHtml } from '../utils/text.js';

const DIGIT_COLORS = ['#c50e03', '#10a108', '#46c4e7', '#b590ea', '#318fbb', '#ff9800', '#949c18'];
const STEP_COLORS = ['#c50e03', '#10a108', '#254ea5', '#b590ea', '#318fbb', '#ff9800'];

function getDigitColor(indexFromRight) {
  return DIGIT_COLORS[indexFromRight % DIGIT_COLORS.length];
}

function getStepColor(index) {
  return STEP_COLORS[index % STEP_COLORS.length];
}

function normalizeOperator(rawOperator) {
  if (['x', 'X', '×', '*'].includes(rawOperator)) return '×';
  if (['÷', ':', '/'].includes(rawOperator)) return '÷';
  if (rawOperator === '−') return '-';
  return rawOperator;
}

function shouldUseColumn(op) {
  return /^\d+$/.test(op.a) && /^\d+$/.test(op.b) && (op.a.length >= 2 || op.b.length >= 2);
}

function padDigits(value, width) {
  return String(value).padStart(width, ' ').split('').map(ch => (ch === ' ' ? '' : ch));
}

function renderDigitCell(content, options = {}) {
  const {
    className = '',
    color = '',
    borderTop = false,
    borderBottom = false,
    borderLeft = false,
    accent = false
  } = options;

  const classes = [
    'column-cell',
    className,
    borderTop ? 'has-top-border' : '',
    borderBottom ? 'has-bottom-border' : '',
    borderLeft ? 'has-left-border' : '',
    accent ? 'is-accent' : ''
  ].filter(Boolean).join(' ');

  const style = color ? ` style="color:${color};"` : '';
  return `<td class="${classes}"${style}>${content ? escapeHtml(content) : '&nbsp;'}</td>`;
}

function renderSignCell(sign = '', className = '') {
  return `<td class="column-sign ${className}">${sign ? escapeHtml(sign) : '&nbsp;'}</td>`;
}

function renderDigitRow(digits, options = {}) {
  const { borderTop = false, borderBottom = false, carryRow = false, digitColors = true } = options;
  return digits.map((digit, index) => {
    const color = digit && digitColors ? getDigitColor(digits.length - 1 - index) : '';
    return renderDigitCell(digit, {
      className: carryRow ? 'carry-cell' : '',
      color,
      borderTop,
      borderBottom,
      accent: Boolean(color)
    });
  }).join('');
}

function formatExpression(a, operator, b, resultText) {
  return `${a} ${operator} ${b} = ${resultText}`;
}

function makeNote(text, color = '') {
  return { text, color };
}

function trimNotes(notes, limit = 8) {
  return notes.slice(0, limit);
}

function renderNotes(notes) {
  if (!notes.length) {
    return '<div class="column-notes-empty">Коротких пояснений нет.</div>';
  }

  return `
    <ol class="column-notes-list">
      ${trimNotes(notes).map(note => {
        const style = note.color ? ` style="--note-accent:${note.color};"` : '';
        return `<li class="column-note"${style}>${escapeHtml(note.text)}</li>`;
      }).join('')}
    </ol>
  `;
}

function renderBlockShell({ title, inlineText, tableHtml, notes }) {
  return `
    <section class="column-card">
      <div class="column-card-head">
        <div class="column-card-title">${escapeHtml(title)}</div>
        <div class="column-card-inline">${escapeHtml(inlineText)}</div>
      </div>
      <div class="column-card-body">
        <div class="column-visual-wrap">
          <div class="column-visual-scroll">
            ${tableHtml}
          </div>
        </div>
        <div class="column-notes">
          <div class="column-notes-title">Коротко по шагам</div>
          ${renderNotes(notes)}
        </div>
      </div>
    </section>
  `;
}

function buildAdditionModel(a, b) {
  const left = Number(a);
  const right = Number(b);
  const result = String(left + right);
  const width = Math.max(result.length, a.length, b.length);
  const topDigits = padDigits(a, width);
  const bottomDigits = padDigits(b, width);
  const resultDigits = padDigits(result, width);
  const carryDigits = Array(width).fill('');
  const notes = [];
  let carry = 0;

  for (let index = width - 1; index >= 0; index -= 1) {
    const power = width - 1 - index;
    const color = getDigitColor(power);
    const aDigit = topDigits[index] ? Number(topDigits[index]) : 0;
    const bDigit = bottomDigits[index] ? Number(bottomDigits[index]) : 0;
    const carryIn = carry;
    const total = aDigit + bDigit + carryIn;
    const digit = total % 10;
    const carryOut = Math.floor(total / 10);

    const parts = [];
    if (topDigits[index]) parts.push(String(aDigit));
    if (bottomDigits[index]) parts.push(String(bDigit));
    if (!parts.length) parts.push('0');
    if (carryIn) parts.push(String(carryIn));

    notes.push(makeNote(`${parts.join(' + ')} = ${total}`, color));
    if (carryOut) {
      notes.push(makeNote(`${digit} пишем, ${carryOut} переносим`, color));
      if (index > 0) carryDigits[index - 1] = `+${carryOut}`;
    }

    carry = carryOut;
  }

  return {
    title: 'Сложение столбиком',
    inlineText: formatExpression(a, '+', b, result),
    notes,
    tableHtml: `
      <table class="column-table arithmetic-table" aria-label="Сложение столбиком">
        <tbody>
          <tr>
            ${renderSignCell('', 'carry-sign')}
            ${renderDigitRow(carryDigits, { carryRow: true, digitColors: false })}
          </tr>
          <tr>
            ${renderSignCell('+')}
            ${renderDigitRow(topDigits)}
          </tr>
          <tr>
            ${renderSignCell('')}
            ${renderDigitRow(bottomDigits)}
          </tr>
          <tr>
            ${renderSignCell('', 'result-sign')}
            ${renderDigitRow(resultDigits, { borderTop: true })}
          </tr>
        </tbody>
      </table>
    `
  };
}

function buildSubtractionModel(a, b) {
  let minuend = Number(a);
  let subtrahend = Number(b);
  const negative = minuend < subtrahend;
  if (negative) {
    [minuend, subtrahend] = [subtrahend, minuend];
  }

  const top = String(minuend);
  const bottom = String(subtrahend);
  const result = String(minuend - subtrahend);
  const resultText = negative ? `-${result}` : result;
  const inlineText = formatExpression(a, '-', b, resultText);
  const width = Math.max(top.length, bottom.length, resultText.length);
  const originalTopDigits = padDigits(top, width);
  const bottomDigits = padDigits(bottom, width);
  const resultDigits = padDigits(resultText, width);
  const borrowMarks = Array(width).fill('');
  const notes = [];

  let borrowIn = 0;
  for (let index = width - 1; index >= 0; index -= 1) {
    const power = width - 1 - index;
    const color = getDigitColor(power);
    const topDigit = originalTopDigits[index] ? Number(originalTopDigits[index]) : 0;
    const bottomDigit = bottomDigits[index] ? Number(bottomDigits[index]) : 0;
    const effectiveTop = topDigit - borrowIn;
    let borrowOut = 0;
    let stepValue = effectiveTop - bottomDigit;

    if (stepValue < 0) {
      borrowOut = 1;
      stepValue += 10;
      if (index > 0) borrowMarks[index - 1] = '-1';
      notes.push(makeNote(`${effectiveTop} меньше ${bottomDigit}, занимаем 1`, color));
    }

    if (bottomDigits[index]) {
      if (borrowOut && borrowIn) {
        notes.push(makeNote(`${topDigit} + 10 - ${bottomDigit} - 1 = ${stepValue}`, color));
      } else if (borrowOut) {
        notes.push(makeNote(`${topDigit + 10} - ${bottomDigit} = ${stepValue}`, color));
      } else if (borrowIn) {
        notes.push(makeNote(`${topDigit} - ${bottomDigit} - 1 = ${stepValue}`, color));
      } else {
        notes.push(makeNote(`${topDigit} - ${bottomDigit} = ${stepValue}`, color));
      }
    } else if (borrowIn) {
      notes.push(makeNote(`${topDigit} - 1 = ${stepValue}`, color));
    } else if (originalTopDigits[index]) {
      notes.push(makeNote(`${topDigit} = ${stepValue}`, color));
    }

    borrowIn = borrowOut;
  }

  if (negative) {
    notes.unshift(makeNote('Первое число меньше второго, ответ отрицательный.', '#c50e03'));
  }

  return {
    title: 'Вычитание столбиком',
    inlineText,
    notes,
    tableHtml: `
      <table class="column-table arithmetic-table" aria-label="Вычитание столбиком">
        <tbody>
          <tr>
            ${renderSignCell('', 'carry-sign')}
            ${renderDigitRow(borrowMarks, { carryRow: true, digitColors: false })}
          </tr>
          <tr>
            ${renderSignCell('-')}
            ${renderDigitRow(originalTopDigits)}
          </tr>
          <tr>
            ${renderSignCell('')}
            ${renderDigitRow(bottomDigits)}
          </tr>
          <tr>
            ${renderSignCell('', 'result-sign')}
            ${renderDigitRow(resultDigits, { borderTop: true })}
          </tr>
        </tbody>
      </table>
    `
  };
}

function buildMultiplicationModel(a, b) {
  const multiplicand = String(a);
  const multiplier = String(b);
  const result = String(Number(a) * Number(b));
  const partials = [];
  const notes = [];
  const multiplierDigits = multiplier.split('');

  for (let rowIndex = multiplierDigits.length - 1; rowIndex >= 0; rowIndex -= 1) {
    const digit = Number(multiplierDigits[rowIndex]);
    const shift = multiplierDigits.length - 1 - rowIndex;
    const color = getStepColor(shift);
    const rowDigits = multiplicand.split('');
    let carry = 0;

    for (let index = rowDigits.length - 1; index >= 0; index -= 1) {
      const aDigit = Number(rowDigits[index]);
      const carryIn = carry;
      const product = aDigit * digit + carryIn;
      const written = product % 10;
      carry = Math.floor(product / 10);
      notes.push(makeNote(`${aDigit} × ${digit}${carryIn ? ` + ${carryIn}` : ''} = ${product}`, color));
      if (carry) {
        notes.push(makeNote(`${written} пишем, ${carry} переносим`, color));
      }
    }

    if (carry) {
      notes.push(makeNote(`${carry} дописываем слева`, color));
    }

    const partialValue = digit === 0
      ? '0'.padEnd(shift + 1, '0')
      : `${Number(multiplicand) * digit}${'0'.repeat(shift)}`;

    partials.push({ value: partialValue, color });
  }

  const partialValues = partials.map(item => item.value);
  const width = Math.max(result.length, multiplicand.length, multiplier.length, ...partialValues.map(value => value.length));
  const topDigits = padDigits(multiplicand, width);
  const bottomDigits = padDigits(multiplier, width);
  const resultDigits = padDigits(result, width);

  return {
    title: 'Умножение столбиком',
    inlineText: formatExpression(a, '×', b, result),
    notes,
    tableHtml: `
      <table class="column-table arithmetic-table" aria-label="Умножение столбиком">
        <tbody>
          <tr>
            ${renderSignCell('×', 'mul-sign')}
            ${renderDigitRow(topDigits, { digitColors: false })}
          </tr>
          <tr>
            ${renderSignCell('')}
            ${bottomDigits.map((digit, index) => renderDigitCell(digit, {
              color: digit ? getDigitColor(bottomDigits.length - 1 - index) : ''
            })).join('')}
          </tr>
          <tr>
            ${renderSignCell('')}
            ${Array.from({ length: width }, () => renderDigitCell('', { borderTop: true })).join('')}
          </tr>
          ${partials.map((partial, rowIndex) => {
            const digits = padDigits(partial.value, width);
            return `
              <tr>
                ${renderSignCell(rowIndex === 0 && partials.length > 1 ? '+' : '', rowIndex === 0 && partials.length > 1 ? 'plus-sign' : '')}
                ${digits.map(digit => renderDigitCell(digit, { color: digit ? partial.color : '' })).join('')}
              </tr>
            `;
          }).join('')}
          <tr>
            ${renderSignCell('')}
            ${Array.from({ length: width }, () => renderDigitCell('', { borderTop: true, className: 'final-line' })).join('')}
          </tr>
          <tr>
            ${renderSignCell('')}
            ${renderDigitRow(resultDigits, { digitColors: false })}
          </tr>
        </tbody>
      </table>
    `
  };
}

function buildDivisionSteps(dividendStr, divisorNumber) {
  const digits = dividendStr.split('').map(Number);
  const steps = [];
  let quotient = '';
  let current = 0;
  let started = false;

  for (let index = 0; index < digits.length; index += 1) {
    current = current * 10 + digits[index];

    if (current < divisorNumber) {
      if (started) quotient += '0';
      continue;
    }

    started = true;
    const qDigit = Math.floor(current / divisorNumber);
    const product = qDigit * divisorNumber;
    const remainder = current - product;
    const currentText = String(current);
    const startIndex = index - currentText.length + 1;

    quotient += String(qDigit);
    steps.push({
      current,
      currentText,
      qDigit,
      product,
      productText: String(product),
      remainder,
      startIndex,
      endIndex: index
    });

    current = remainder;
  }

  if (!started) quotient = '0';

  return { steps, quotient, remainder: current };
}

function renderDivisionDividendCells({ text = '', startIndex = 0, width, color = '', borderBottom = false }) {
  const cells = [];
  const digits = String(text).split('');
  for (let index = 0; index < width; index += 1) {
    const local = index - startIndex;
    const digit = local >= 0 && local < digits.length ? digits[local] : '';
    cells.push(renderDigitCell(digit, {
      color: digit ? color : '',
      borderBottom,
      className: borderBottom ? 'division-step-border' : ''
    }));
  }
  return cells.join('');
}

function buildDivisionModel(a, b) {
  const dividend = Number(a);
  const divisor = Number(b);
  if (divisor === 0) {
    return {
      title: 'Деление столбиком',
      inlineText: `${a} ÷ ${b}`,
      notes: [makeNote('На ноль делить нельзя.', '#c50e03')],
      tableHtml: '<div class="division-error">На ноль делить нельзя.</div>'
    };
  }

  const dividendStr = String(dividend);
  const divisorStr = String(divisor);
  const { steps, quotient, remainder } = buildDivisionSteps(dividendStr, divisor);
  const inlineResult = remainder === 0 ? quotient : `${quotient} ост. ${remainder}`;
  const rightWidth = Math.max(divisorStr.length, quotient.length);
  const dividendWidth = dividendStr.length;
  const notes = [];

  steps.forEach((step, index) => {
    const color = getStepColor(index);
    const remainderText = step.remainder ? `, ост. ${step.remainder}` : '';
    notes.push(makeNote(`${step.current} ÷ ${divisor} = ${step.qDigit}${remainderText}; ${step.qDigit} × ${divisor} = ${step.product}`, color));
  });

  if (!steps.length) {
    notes.push(makeNote('Делимое меньше делителя, в частном 0.', '#c50e03'));
  }

  const quotientCells = Array.from({ length: rightWidth }, (_, index) => {
    const digit = quotient[index] || '';
    const color = digit && steps[index] ? getStepColor(index) : '';
    return renderDigitCell(digit, {
      color,
      borderTop: true,
      borderLeft: index === 0
    });
  }).join('');

  const topRow = `
    <tr>
      ${renderSignCell('')}
      ${padDigits(dividendStr, dividendWidth).map(digit => renderDigitCell(digit)).join('')}
      ${Array.from({ length: rightWidth }, (_, index) => {
        const digit = divisorStr[index] || '';
        return renderDigitCell(digit, { borderLeft: index === 0 });
      }).join('')}
    </tr>
  `;

  const secondRow = `
    <tr>
      ${renderSignCell(steps.length ? '-' : '')}
      ${steps.length
        ? renderDivisionDividendCells({
            text: steps[0].productText,
            startIndex: steps[0].startIndex,
            width: dividendWidth,
            color: getStepColor(0),
            borderBottom: true
          })
        : renderDivisionDividendCells({ text: '', startIndex: 0, width: dividendWidth })}
      ${quotientCells}
    </tr>
  `;

  const stepRows = [];
  for (let index = 1; index < steps.length; index += 1) {
    const step = steps[index];
    const color = getStepColor(index);
    stepRows.push(`
      <tr>
        ${renderSignCell('')}
        ${renderDivisionDividendCells({
          text: step.currentText,
          startIndex: step.startIndex,
          width: dividendWidth
        })}
        ${Array.from({ length: rightWidth }, () => renderDigitCell('')).join('')}
      </tr>
      <tr>
        ${renderSignCell('-')}
        ${renderDivisionDividendCells({
          text: step.productText,
          startIndex: step.startIndex,
          width: dividendWidth,
          color,
          borderBottom: true
        })}
        ${Array.from({ length: rightWidth }, () => renderDigitCell('')).join('')}
      </tr>
    `);
  }

  const lastStep = steps[steps.length - 1];
  const remainderText = String(remainder || 0);
  const remainderStart = steps.length ? lastStep.endIndex - remainderText.length + 1 : dividendWidth - remainderText.length;

  const remainderRow = `
    <tr>
      ${renderSignCell('')}
      ${renderDivisionDividendCells({
        text: remainderText,
        startIndex: Math.max(0, remainderStart),
        width: dividendWidth
      })}
      ${Array.from({ length: rightWidth }, () => renderDigitCell('')).join('')}
    </tr>
  `;

  return {
    title: 'Деление столбиком',
    inlineText: formatExpression(a, '÷', b, inlineResult),
    notes,
    tableHtml: `
      <table class="column-table division-table" aria-label="Деление столбиком">
        <tbody>
          ${topRow}
          ${secondRow}
          ${stepRows.join('')}
          ${remainderRow}
        </tbody>
      </table>
    `
  };
}

function buildColumnModel(operation) {
  if (operation.operator === '+') return buildAdditionModel(operation.a, operation.b);
  if (operation.operator === '-') return buildSubtractionModel(operation.a, operation.b);
  if (operation.operator === '×') return buildMultiplicationModel(operation.a, operation.b);
  return buildDivisionModel(operation.a, operation.b);
}

function renderColumnBlock(operation) {
  return renderBlockShell(buildColumnModel(operation));
}

function extractOperations(text) {
  if (!text) return [];
  const found = [];
  const patterns = [
    { regex: /(\d+)\s+\/\s+(\d+)(?:\s*=\s*(-?\d+))?/g, operator: '/' },
    { regex: /(\d+)\s*([+\-xX×*:÷])\s*(\d+)(?:\s*=\s*(-?\d+))?/g, operator: null }
  ];

  patterns.forEach(({ regex, operator }) => {
    let match;
    while ((match = regex.exec(text)) !== null) {
      const raw = match[0];
      const start = match.index;
      const end = start + raw.length;
      const before = start > 0 ? text[start - 1] : '';
      const after = end < text.length ? text[end] : '';

      if ((before && /[\dA-Za-zА-Яа-я]/.test(before)) || (after && /[A-Za-zА-Яа-я]/.test(after))) {
        continue;
      }

      const a = match[1];
      const rawOperator = operator || match[2];
      const b = operator ? match[2] : match[3];
      const normalizedOperator = normalizeOperator(rawOperator);

      found.push({
        a,
        b,
        operator: normalizedOperator,
        index: start
      });
    }
  });

  return found
    .filter(shouldUseColumn)
    .sort((left, right) => left.index - right.index);
}

function dedupeOperations(items) {
  const seen = new Set();
  const result = [];

  items.forEach(item => {
    const key = `${item.a}|${item.operator}|${item.b}`;
    if (seen.has(key)) return;
    seen.add(key);
    result.push(item);
  });

  return result;
}

function scoreOperationForFallback(operation, text) {
  let score = 0;
  const expression = `${operation.a} ${operation.operator} ${operation.b}`;
  if (text.includes(`${expression} =`)) score += 3;
  if (operation.operator === '÷') score += 2;
  if (operation.a.length >= 3 || operation.b.length >= 3) score += 1;
  return score;
}

function collectOperations(taskText, explanationText) {
  const taskOperations = dedupeOperations(extractOperations(taskText));
  if (taskOperations.length) {
    return taskOperations;
  }

  const explanationOperations = dedupeOperations(extractOperations(explanationText));
  if (!explanationOperations.length) {
    return [];
  }

  const scored = explanationOperations
    .map(operation => ({
      operation,
      score: scoreOperationForFallback(operation, explanationText)
    }))
    .sort((left, right) => right.score - left.score || left.operation.index - right.operation.index)
    .map(item => item.operation);

  return scored.slice(0, 3);
}

function renderExplanationText(text) {
  const safe = escapeHtml(text || '');
  if (!safe.trim()) {
    return '<p>Здесь появится объяснение и ответ.</p>';
  }

  return safe
    .split(/\n{2,}/)
    .map(part => part.replace(/\n/g, '<br>'))
    .map(part => `<p>${part}</p>`)
    .join('');
}

export function renderExplanationWithColumns({ explanationText, taskText }) {
  const operations = collectOperations(taskText, explanationText);
  const blocksHtml = operations.length
    ? `
      <div class="column-blocks">
        ${operations.map(renderColumnBlock).join('')}
      </div>
    `
    : '';

  return `
    <div class="result-rich-text">
      <div class="result-text-flow">
        ${renderExplanationText(explanationText)}
      </div>
      ${blocksHtml}
    </div>
  `;
}
