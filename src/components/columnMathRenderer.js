import { escapeHtml, splitExplanationLines } from '../utils/text.js';

const DIGIT_COLORS = ['#c50e03', '#10a108', '#46c4e7', '#b590ea', '#318fbb', '#ff9800', '#949c18'];
const STEP_COLORS = ['#c50e03', '#10a108', '#254ea5', '#b590ea', '#318fbb', '#ff9800'];

function getDigitColor(indexFromRight) {
  return DIGIT_COLORS[indexFromRight % DIGIT_COLORS.length];
}

function getStepColor(index) {
  return STEP_COLORS[index % STEP_COLORS.length];
}

function normalizeOperator(rawOperator) {
  if (['x', 'X', 'х', 'Х', '×', '*'].includes(rawOperator)) return '×';
  if (['÷', ':', '/'].includes(rawOperator)) return '÷';
  if (rawOperator === '−') return '-';
  return rawOperator;
}

function shouldUseColumn(operation) {
  return /^\d+$/.test(operation.a) && /^\d+$/.test(operation.b) && (operation.a.length >= 2 || operation.b.length >= 2);
}

function padDigits(value, width) {
  return String(value).padStart(width, ' ').split('').map(char => (char === ' ' ? '' : char));
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

function trimNotes(notes, limit = 20) {
  return notes.slice(0, limit);
}

function renderNotes(noteItems) {
  if (!noteItems.length) {
    return '<div class="column-notes-empty">Пояснений пока нет.</div>';
  }

  return `
    <ol class="column-notes-list">
      ${trimNotes(noteItems).map(note => {
        const style = note.color ? ` style="--note-accent:${note.color};"` : '';
        const attrs = typeof note.lineIndex === 'number' ? ` data-result-line-index="${note.lineIndex}"` : '';
        return `<li class="column-note"${style}${attrs}>${escapeHtml(note.text)}</li>`;
      }).join('')}
    </ol>
  `;
}

function renderBlockShell({ title, titleLineIndex, tableHtml, noteItems = [] }) {
  const titleAttrs = typeof titleLineIndex === 'number' ? ` data-result-line-index="${titleLineIndex}"` : '';
  return `
    <section class="column-card">
      <div class="column-card-head">
        <div class="column-card-title"${titleAttrs}>${escapeHtml(title)}</div>
      </div>
      <div class="column-card-body">
        <div class="column-visual-wrap">
          <div class="column-visual-scroll">
            ${tableHtml}
          </div>
        </div>
        <div class="column-notes">
          <div class="column-notes-title">Пояснения</div>
          ${renderNotes(noteItems)}
        </div>
      </div>
    </section>
  `;
}

function formatMethodTitle(operator) {
  if (operator === '+') return 'Метод сложения в столбик';
  if (operator === '-') return 'Метод вычитания в столбик';
  if (operator === '×') return 'Метод умножения в столбик';
  return 'Метод деления в столбик';
}

function parseDivisionNotePayload(text) {
  const match = String(text || '').match(/^(\d+)\s*[÷:]\s*(\d+)\s*=\s*(\d+),\s*(\d+)\s*[×x]\s*\2\s*=\s*(\d+)(?:,\s*остаток\s*(\d+))?$/i);
  if (!match) return null;
  return {
    current: match[1],
    divisor: match[2],
    qDigit: match[3],
    product: match[5],
    remainder: match[6] || '0'
  };
}

function normalizeAdditionNoteText(text) {
  let normalized = String(text || '').trim();
  let match = normalized.match(/^(\d+)\s+пишем,\s+(\d+)\s+переносим$/i);
  if (match) {
    return `Пишем ${match[1]}, ${match[2]} переносим в следующий разряд.`;
  }
  match = normalized.match(/^(.+?)\s*=\s*(\d+)$/);
  if (match && /\+/.test(match[1])) {
    return `Складываем в этом разряде: ${match[1]} = ${match[2]}.`;
  }
  return normalized;
}

function normalizeSubtractionNoteText(text) {
  let normalized = String(text || '').trim();
  let match = normalized.match(/^(.+?)\s+меньше\s+(.+?),\s+занимаем 1$/i);
  if (match) {
    return `${match[1]} меньше ${match[2]}, поэтому занимаем 1 у соседнего разряда.`;
  }
  match = normalized.match(/^(.+?)\s*=\s*(-?\d+)$/);
  if (match && /-/.test(match[1])) {
    return `Вычитаем в этом разряде: ${match[1]} = ${match[2]}.`;
  }
  if (/^первое число меньше второго, ответ отрицательный\.?$/i.test(normalized)) {
    return 'Первое число меньше второго, поэтому ответ будет отрицательным.';
  }
  return normalized;
}

function normalizeMultiplicationNoteText(text) {
  let normalized = String(text || '').trim();
  let match = normalized.match(/^(\d+)\s*[×x]\s*(\d+)(?:\s*\+\s*(\d+))?\s*=\s*(\d+)$/i);
  if (match) {
    const carryPart = match[3] ? ` и прибавляем ${match[3]}` : '';
    return `Умножаем ${match[1]} на ${match[2]}${carryPart}: получаем ${match[4]}.`;
  }
  match = normalized.match(/^(\d+)\s+пишем,\s+(\d+)\s+переносим$/i);
  if (match) {
    return `Пишем ${match[1]}, ${match[2]} переносим в следующий разряд.`;
  }
  match = normalized.match(/^(\d+)\s+дописываем слева$/i);
  if (match) {
    return `Оставшийся перенос ${match[1]} дописываем слева.`;
  }
  return normalized;
}

function normalizeDivisionNotes(notes) {
  const trimmed = trimNotes(notes, 12);
  if (!trimmed.length) return [];

  const normalized = [];
  normalized.push({
    ...trimmed[0],
    text: 'Определяем первое неполное делимое. Оно должно быть больше или равно делителю.'
  });

  trimmed.forEach((note, index) => {
    const payload = parseDivisionNotePayload(note.text);
    if (!payload) {
      const raw = String(note.text || '').trim();
      if (/^делимое меньше делителя, в частном 0\.?$/i.test(raw)) {
        normalized.push({ ...note, text: 'Делимое меньше делителя, поэтому в частном пишем 0.' });
        return;
      }
      normalized.push({ ...note, text: raw });
      return;
    }

    const current = Number(payload.current);
    const divisor = Number(payload.divisor);
    const qDigit = Number(payload.qDigit);
    const product = Number(payload.product);
    const remainder = Number(payload.remainder || 0);
    const nextTry = (qDigit + 1) * divisor;
    const nextPayload = trimmed[index + 1] ? parseDivisionNotePayload(trimmed[index + 1].text) : null;

    normalized.push({
      ...note,
      text: index === 0
        ? `Сначала берём первое неполное делимое ${current}.`
        : `Теперь работаем с числом ${current}.`
    });

    if (nextTry > current) {
      normalized.push({
        ...note,
        text: `Смотрим, сколько раз ${divisor} помещается в ${current}. Берём ${qDigit}, потому что ${qDigit} × ${divisor} = ${product}, а ${qDigit + 1} × ${divisor} = ${nextTry}, это уже больше.`
      });
    } else {
      normalized.push({
        ...note,
        text: `Смотрим, сколько раз ${divisor} помещается в ${current}. Берём ${qDigit}, потому что ${qDigit} × ${divisor} = ${product}.`
      });
    }

    normalized.push({
      ...note,
      text: `Пишем ${qDigit} в частном и вычитаем ${product} из ${current}. Остаётся ${remainder}.`
    });

    if (nextPayload) {
      normalized.push({
        ...note,
        text: `Сносим следующую цифру и получаем ${Number(nextPayload.current)}.`
      });
    } else if (remainder === 0) {
      normalized.push({ ...note, text: 'Деление закончено без остатка.' });
    } else {
      normalized.push({ ...note, text: `Получаем остаток ${remainder}. Он меньше делителя, значит деление закончено.` });
    }
  });

  return trimNotes(normalized, 20);
}

function normalizeTeachingNotes(notes, operator) {
  const source = trimNotes(notes).map(note => ({ ...note }));
  if (operator === '+') {
    return source.map(note => ({ ...note, text: normalizeAdditionNoteText(note.text) }));
  }
  if (operator === '-') {
    return source.map(note => ({ ...note, text: normalizeSubtractionNoteText(note.text) }));
  }
  if (operator === '×') {
    return source.map(note => ({ ...note, text: normalizeMultiplicationNoteText(note.text) }));
  }
  return normalizeDivisionNotes(source);
}

function decorateColumnModel(model, operation) {
  return {
    ...model,
    title: formatMethodTitle(operation.operator),
    inlineText: '',
    notes: normalizeTeachingNotes(model.notes || [], operation.operator)
  };
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

function buildDivisionSteps(dividendText, divisorNumber) {
  const digits = dividendText.split('').map(Number);
  const steps = [];
  let current = '';
  let quotient = '';
  let started = false;

  for (let index = 0; index < digits.length; index += 1) {
    current += String(digits[index]);
    const currentNumber = Number(current);

    if (currentNumber < divisorNumber) {
      if (started) quotient += '0';
      continue;
    }

    started = true;
    const qDigit = Math.floor(currentNumber / divisorNumber);
    const product = qDigit * divisorNumber;
    const remainder = currentNumber - product;
    const currentText = String(currentNumber);
    const startIndex = index - currentText.length + 1;

    quotient += String(qDigit);
    steps.push({
      index: steps.length,
      current: currentNumber,
      currentText,
      qDigit,
      product,
      productText: String(product),
      remainder,
      startIndex,
      endIndex: index
    });

    current = String(remainder);
  }

  if (!started) {
    quotient = '0';
  }

  return {
    steps,
    quotient,
    remainder: Number(current || '0')
  };
}

function renderDivisionCells(text, startIndex, width, options = {}) {
  const { color = '', borderBottom = false } = options;
  const digits = String(text || '').split('');
  const cells = [];

  for (let index = 0; index < width; index += 1) {
    const localIndex = index - startIndex;
    const digit = localIndex >= 0 && localIndex < digits.length ? digits[localIndex] : '';
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

  const dividendText = String(dividend);
  const divisorText = String(divisor);
  const { steps, quotient, remainder } = buildDivisionSteps(dividendText, divisor);
  const inlineResult = remainder === 0 ? quotient : `${quotient} ост. ${remainder}`;
  const dividendWidth = dividendText.length;
  const rightWidth = Math.max(divisorText.length, quotient.length);
  const notes = [];

  steps.forEach((step, index) => {
    const color = getStepColor(index);
    if (step.remainder) {
      notes.push(makeNote(`${step.current} ÷ ${divisor} = ${step.qDigit}, ${step.qDigit} × ${divisor} = ${step.product}, остаток ${step.remainder}`, color));
    } else {
      notes.push(makeNote(`${step.current} ÷ ${divisor} = ${step.qDigit}, ${step.qDigit} × ${divisor} = ${step.product}`, color));
    }
  });

  if (!steps.length) {
    notes.push(makeNote('Делимое меньше делителя, в частном 0.', '#c50e03'));
  }

  const dividendRow = `
    <tr>
      ${renderSignCell('')}
      ${padDigits(dividendText, dividendWidth).map(digit => renderDigitCell(digit)).join('')}
      ${Array.from({ length: rightWidth }, (_, index) => {
        const digit = divisorText[index] || '';
        return renderDigitCell(digit, { borderLeft: index === 0 });
      }).join('')}
    </tr>
  `;

  const quotientRow = `
    <tr>
      ${renderSignCell(steps.length ? '-' : '')}
      ${steps.length
        ? renderDivisionCells(steps[0].productText, steps[0].startIndex, dividendWidth, {
            color: getStepColor(0),
            borderBottom: true
          })
        : renderDivisionCells('', 0, dividendWidth)}
      ${Array.from({ length: rightWidth }, (_, index) => {
        const digit = quotient[index] || '';
        return renderDigitCell(digit, {
          color: digit && steps[index] ? getStepColor(index) : '',
          borderTop: true,
          borderLeft: index === 0
        });
      }).join('')}
    </tr>
  `;

  const processRows = [];

  for (let index = 1; index < steps.length; index += 1) {
    const step = steps[index];
    const color = getStepColor(index);

    processRows.push(`
      <tr>
        ${renderSignCell('')}
        ${renderDivisionCells(step.currentText, step.startIndex, dividendWidth)}
        ${Array.from({ length: rightWidth }, () => renderDigitCell('')).join('')}
      </tr>
      <tr>
        ${renderSignCell('-')}
        ${renderDivisionCells(step.productText, step.startIndex, dividendWidth, {
          color,
          borderBottom: true
        })}
        ${Array.from({ length: rightWidth }, () => renderDigitCell('')).join('')}
      </tr>
    `);
  }

  const lastStep = steps[steps.length - 1];
  const remainderText = String(remainder || 0);
  const remainderStart = steps.length
    ? Math.max(0, lastStep.endIndex - remainderText.length + 1)
    : Math.max(0, dividendWidth - remainderText.length);

  const remainderRow = `
    <tr>
      ${renderSignCell('')}
      ${renderDivisionCells(remainderText, remainderStart, dividendWidth, {
        color: remainder === 0 ? '' : getStepColor(steps.length)
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
          ${dividendRow}
          ${quotientRow}
          ${processRows.join('')}
          ${remainderRow}
        </tbody>
      </table>
    `
  };
}

function buildColumnModel(operation) {
  let model;
  if (operation.operator === '+') model = buildAdditionModel(operation.a, operation.b);
  else if (operation.operator === '-') model = buildSubtractionModel(operation.a, operation.b);
  else if (operation.operator === '×') model = buildMultiplicationModel(operation.a, operation.b);
  else model = buildDivisionModel(operation.a, operation.b);
  return decorateColumnModel(model, operation);
}

function renderColumnBlock(block) {
  return renderBlockShell(block);
}

function looksLikeFractionContext(text, match, operator) {
  if (operator !== '÷') return false;

  const raw = match[0];
  const normalizedRaw = raw.replace(/\s+/g, '');
  const compactText = String(text || '').replace(/\s+/g, '');
  const fractionLikeMatches = compactText.match(/\d+\/\d+/g) || [];

  return fractionLikeMatches.length > 1 && /^\d+\/\d+$/.test(normalizedRaw);
}

function extractOperations(text) {
  if (!text) return [];

  const found = [];
  const regex = /(\d+)\s*([+\-xXхХ×*:\/÷])\s*(\d+)(?:\s*=\s*(-?\d+))?/g;
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

    const normalizedOperator = normalizeOperator(match[2]);

    if (looksLikeFractionContext(text, match, normalizedOperator)) {
      continue;
    }

    found.push({
      a: match[1],
      b: match[3],
      operator: normalizedOperator,
      index: start
    });
  }

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

function isDirectMathTask(taskText) {
  const normalized = String(taskText || '').trim();
  if (!normalized) return false;
  return /^[0-9xXхХ\s+\-*/:÷×=().?]+$/.test(normalized);
}

function isSimpleDirectOperationTask(taskText) {
  const normalized = String(taskText || '').trim();
  if (!normalized) return false;
  return /^\d+\s*([+\-xXхХ×*:\/÷])\s*\d+\s*(?:=\s*\??)?\s*\??$/.test(normalized);
}

function hasNarrativeText(taskText) {
  return /[A-Za-zА-Яа-я]/.test(String(taskText || ''));
}

function extractStepHeaderOperations(explanationText) {
  const lines = String(explanationText || '')
    .replace(/\r/g, '')
    .split(/\n+/)
    .map(line => line.trim())
    .filter(Boolean);

  const stepLines = lines.filter(line => /^\d+\)/.test(line));
  return dedupeOperations(stepLines.flatMap(line => extractOperations(line)));
}

function collectOperations(taskText, explanationText) {
  if (/^Ошибка:\s*/i.test(String(explanationText || '').trim())) {
    return [];
  }

  const normalizedTask = String(taskText || '').trim();
  if (isEquationTask(normalizedTask)) {
    return [];
  }
  if (/\d+\s*\/\s*\d+\s*[+\-]\s*\d+\s*\/\s*\d+/i.test(normalizedTask)) {
    return [];
  }

  const taskOperations = dedupeOperations(extractOperations(taskText));
  const simpleDirectTask = isSimpleDirectOperationTask(normalizedTask);
  if (taskOperations.length && simpleDirectTask) {
    return taskOperations;
  }

  if (hasNarrativeText(taskText) && !isDirectMathTask(taskText)) {
    return [];
  }

  const stepHeaderOperations = extractStepHeaderOperations(explanationText);
  if (stepHeaderOperations.length) {
    return stepHeaderOperations;
  }

  const explanationOperations = dedupeOperations(extractOperations(explanationText));
  if (!explanationOperations.length) {
    return taskOperations;
  }

  if (taskOperations.length) {
    return dedupeOperations([...taskOperations, ...explanationOperations]);
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

function looksLikeOrderMarkersLine(text) {
  const value = String(text || '').trim().replace(/[.!?]+$/g, '').trim();
  return Boolean(value) && /^[\d\s]+$/.test(value) && /\d/.test(value) && /\s/.test(value);
}

function looksLikePureMathLine(text) {
  const value = String(text || '').trim();
  return Boolean(value)
    && /^[\d\s()+\-×÷:/*=.]+$/.test(value)
    && /[+\-×÷:/*=]/.test(value)
    && /\d/.test(value);
}

function extractSingleDirectOperation(taskText) {
  const normalized = String(taskText || '').trim();
  const match = normalized.match(/^(\d+)\s*([+\-xXхХ×*:\/÷])\s*(\d+)\s*(?:=\s*\??)?\s*\??$/);
  if (!match) return null;
  return {
    a: match[1],
    b: match[3],
    operator: normalizeOperator(match[2]),
    index: 0
  };
}

function ensureSentenceEnding(text) {
  const value = String(text || '').trim();
  if (!value) return '';
  if (/[.!?…:]$/.test(value)) return value;
  if (looksLikeOrderMarkersLine(value) || looksLikePureMathLine(value)) return value;
  return `${value}.`;
}

function hasLetters(text) {
  return /[A-Za-zА-Яа-я]/.test(String(text || ''));
}

function isEquationTask(taskText) {
  const text = String(taskText || '').trim();
  return /[xх]/i.test(text) && /=/.test(text);
}

function inferExplanationKind(taskText) {
  const text = String(taskText || '').trim();
  if (isEquationTask(text)) return 'equation';
  if (/(периметр|площадь|квадрат|прямоугольник)/i.test(text)) return 'geometry';
  if (hasNarrativeText(text) && !isDirectMathTask(text)) return 'word';
  if (/\d+\s*\/\s*\d+\s*[+\-]\s*\d+\s*\/\s*\d+/i.test(text)) return 'fraction';
  return 'expression';
}

function extractSectionValue(line, prefixPattern) {
  return String(line || '').replace(prefixPattern, '').trim().replace(/[.!?]+$/g, '').trim();
}

function computeOperationAnswerValue(operation) {
  const left = Number(operation?.a);
  const right = Number(operation?.b);
  if (!Number.isFinite(left) || !Number.isFinite(right)) return '';

  if (operation.operator === '+') return String(left + right);
  if (operation.operator === '-') return String(left - right);
  if (operation.operator === '×') return String(left * right);
  if (operation.operator === '÷') {
    if (right === 0) return 'деление на ноль невозможно';
    const quotient = Math.floor(left / right);
    const remainder = left % right;
    return remainder === 0 ? String(quotient) : `${quotient}, остаток ${remainder}`;
  }

  return '';
}

function defaultAdviceForOperation(operation) {
  if (operation.operator === '+') {
    return 'Чтобы найти сумму чисел, нужно выполнить арифметическое действие сложения. Результат этого действия называется суммой, а числа, которые складываются, — слагаемыми.';
  }
  if (operation.operator === '-') {
    return 'Чтобы найти разность чисел, нужно из уменьшаемого вычесть вычитаемое. Результат называется разностью.';
  }
  if (operation.operator === '×') {
    return 'Чтобы найти произведение, нужно выполнить умножение. Числа при умножении называются множителями.';
  }
  return 'Чтобы найти первое неполное делимое, нужно сравнить с делителем самую левую цифру делимого. Если она меньше делителя, присоединяем следующую цифру и продолжаем так, пока число не станет равно или больше делителя.';
}

function buildOperationLeadLines(operation) {
  const answerValue = computeOperationAnswerValue(operation);
  const expression = formatExpression(operation.a, operation.operator, operation.b, answerValue || '?');

  if (!shouldUseColumn(operation)) {
    if (operation.operator === '+') {
      return [
        `Пример: ${expression}.`,
        'Решение.',
        'Пример в одно действие.',
        'Нужно найти сумму чисел.',
        `Считаем: ${operation.a} + ${operation.b} = ${answerValue}.`
      ];
    }
    if (operation.operator === '-') {
      return [
        `Пример: ${expression}.`,
        'Решение.',
        'Пример в одно действие.',
        'Нужно найти разность чисел.',
        `Считаем: ${operation.a} - ${operation.b} = ${answerValue}.`
      ];
    }
    if (operation.operator === '×') {
      return [
        `Пример: ${expression}.`,
        'Решение.',
        'Пример в одно действие.',
        'Нужно найти произведение чисел.',
        `Считаем: ${operation.a} × ${operation.b} = ${answerValue}.`
      ];
    }
    if (Number(operation.b) === 0) {
      return ['На ноль делить нельзя.'];
    }
    return [
      `Пример: ${expression}.`,
      'Решение.',
      'Пример в одно действие.',
      'Нужно найти частное чисел.',
      `Считаем: ${operation.a} ÷ ${operation.b} = ${answerValue}.`
    ];
  }

  if (operation.operator === '+') {
    return ['Ищем сумму чисел.', 'Будем складывать по разрядам и записывать решение столбиком.'];
  }
  if (operation.operator === '-') {
    return ['Ищем разность чисел.', 'Будем вычитать по разрядам справа налево и, если нужно, занимать 1 у соседнего разряда.'];
  }
  if (operation.operator === '×') {
    return ['Ищем произведение.', 'Будем умножать по разрядам справа налево и при необходимости переносить десятки.'];
  }
  if (Number(operation.b) === 0) {
    return ['На ноль делить нельзя.'];
  }
  return ['Ищем результат деления — частное.', 'Будем делить по шагам и записывать решение столбиком.'];
}

function normalizeRawSectionLabel(line) {
  const trimmed = String(line || '').trim();
  if (!trimmed) return '';
  if (/^ответ\s*:/i.test(trimmed)) {
    return `Ответ: ${trimmed.replace(/^ответ\s*:/i, '').trim()}`.trim();
  }
  if (/^совет\s*:/i.test(trimmed)) {
    return `Совет: ${trimmed.replace(/^совет\s*:/i, '').trim()}`.trim();
  }
  if (/^проверка\s*:/i.test(trimmed)) {
    return `Проверка: ${trimmed.replace(/^проверка\s*:/i, '').trim()}`.trim();
  }
  return trimmed;
}

function splitRawStructuredSections(explanationText) {
  const lines = String(explanationText || '')
    .replace(/\r/g, '')
    .split(/\n+/)
    .map(line => normalizeRawSectionLabel(line))
    .map(line => line.trim())
    .filter(Boolean);

  const bodyLines = [];
  let answerLine = '';
  let adviceLine = '';
  let checkLine = '';

  lines.forEach(line => {
    if (/^Ответ:/i.test(line)) {
      const value = extractSectionValue(line, /^Ответ:\s*/i);
      if (value) answerLine = `Ответ: ${ensureSentenceEnding(value)}`;
      return;
    }
    if (/^Совет:/i.test(line)) {
      const value = extractSectionValue(line, /^Совет:\s*/i);
      if (value) adviceLine = `Совет: ${ensureSentenceEnding(value)}`;
      return;
    }
    if (/^Проверка:/i.test(line)) {
      const value = extractSectionValue(line, /^Проверка:\s*/i);
      if (value) checkLine = `Проверка: ${ensureSentenceEnding(value)}`;
      return;
    }
    bodyLines.push(line);
  });

  return { bodyLines, answerLine, adviceLine, checkLine };
}

function splitStructuredSections(explanationText) {
  const lines = splitExplanationLines(explanationText);
  const bodyLines = [];
  let answerLine = '';
  let adviceLine = '';
  let checkLine = '';

  lines.forEach(line => {
    if (/^Ответ:/i.test(line)) {
      const value = extractSectionValue(line, /^Ответ:\s*/i);
      if (value) answerLine = `Ответ: ${ensureSentenceEnding(value)}`;
      return;
    }
    if (/^Совет:/i.test(line)) {
      const value = extractSectionValue(line, /^Совет:\s*/i);
      if (value) adviceLine = `Совет: ${ensureSentenceEnding(value)}`;
      return;
    }
    if (/^Проверка:/i.test(line)) {
      const value = extractSectionValue(line, /^Проверка:\s*/i);
      if (value) checkLine = `Проверка: ${ensureSentenceEnding(value)}`;
      return;
    }
    bodyLines.push(ensureSentenceEnding(line));
  });

  return { bodyLines, answerLine, adviceLine, checkLine };
}

function buildOperationFragments(operation) {
  const operators = new Set([operation.operator]);
  if (operation.operator === '×') {
    operators.add('*');
    operators.add('x');
    operators.add('х');
  }
  if (operation.operator === '÷') {
    operators.add('/');
    operators.add(':');
  }
  if (operation.operator === '-') {
    operators.add('–');
    operators.add('−');
  }

  return [...operators].flatMap(operator => ([
    `${operation.a} ${operator} ${operation.b}`,
    `${operation.a}${operator}${operation.b}`
  ]));
}

function normalizeMathMatchText(text) {
  return String(text || '')
    .replace(/[−–]/g, '-')
    .replace(/[xXхХ*]/g, '×')
    .replace(/[:/]/g, '÷')
    .replace(/\s+/g, ' ')
    .trim();
}

function lineMatchesOperation(line, operation) {
  const normalizedLine = normalizeMathMatchText(line);
  return buildOperationFragments(operation).some(fragment => normalizedLine.includes(normalizeMathMatchText(fragment)));
}

function ensureStepLineHasResult(line, operation) {
  const text = String(line || '').trim();
  if (!text || !operation || /=/.test(text) || !lineMatchesOperation(text, operation)) {
    return ensureSentenceEnding(text);
  }
  const result = computeOperationAnswerValue(operation);
  if (!result) return ensureSentenceEnding(text);
  return ensureSentenceEnding(`${text.replace(/[.!?]+$/g, '').trim()} = ${result}`);
}

function extractCompoundExpressionBodyLines(explanationText) {
  const parsed = splitRawStructuredSections(explanationText);
  const kept = [];
  const seen = new Set();
  let skipColumnDetails = false;
  let waitingForOrderLine = false;

  const pushLine = line => {
    const prepared = ensureSentenceEnding(line);
    const key = prepared.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    kept.push(prepared);
  };

  parsed.bodyLines.forEach(rawLine => {
    const line = String(rawLine || '').trim();
    if (!line || /^-{3,}$/.test(line)) return;

    if (/^Порядок действий:?$/i.test(line)) {
      skipColumnDetails = false;
      waitingForOrderLine = true;
      pushLine(line);
      return;
    }

    if (waitingForOrderLine) {
      if (looksLikeOrderMarkersLine(line)) {
        pushLine(line);
        return;
      }
      if (looksLikePureMathLine(line)) {
        pushLine(line);
        waitingForOrderLine = false;
        return;
      }
    }

    if (/^(Запись столбиком|Пояснение(?: по шагам| к действию)?|Метод .+ столбик)/i.test(line)) {
      skipColumnDetails = true;
      waitingForOrderLine = false;
      return;
    }

    if (skipColumnDetails) {
      const resumesFlow = /^\d+\)/.test(line)
        || /^Пример:/i.test(line)
        || /^Порядок действий:?$/i.test(line)
        || /^Решение(?: по действиям)?[.:]?$/i.test(line);
      if (!resumesFlow) {
        return;
      }
      skipColumnDetails = false;
    }

    if (
      /^Пример:/i.test(line)
      || /^Решение по действиям:?$/i.test(line)
      || /^Решение\.?$/i.test(line)
      || /^\d+\)/.test(line)
    ) {
      pushLine(line);
    }
  });

  return {
    bodyLines: kept,
    answerLine: parsed.answerLine,
    adviceLine: parsed.adviceLine,
    checkLine: parsed.checkLine
  };
}

function bodyLineLooksLikeImmediateResult(line, operation) {
  const text = String(line || '').trim();
  if (!text || !operation) return false;
  if (!/=/.test(text)) return false;

  const fragments = [
    `${operation.a} ${operation.operator} ${operation.b}`,
    `${operation.a}${operation.operator}${operation.b}`,
    `${operation.a} ${operation.operator === '×' ? '*' : operation.operator} ${operation.b}`,
    `${operation.a} ${operation.operator === '÷' ? '/' : operation.operator} ${operation.b}`,
    `${operation.a} ${operation.operator === '÷' ? ':' : operation.operator} ${operation.b}`
  ];

  return fragments.some(fragment => text.includes(fragment))
    || /^(считаем|делим|умножаем|складываем|вычитаем|получаем)\s*:/i.test(text);
}

function cleanGenericBodyLines(lines, kind, operation) {
  const cleaned = [];
  const seen = new Set();

  lines.forEach((line, index) => {
    const text = ensureSentenceEnding(line);
    if (!text) return;
    if (kind !== 'equation' && operation && index === 0 && bodyLineLooksLikeImmediateResult(text, operation)) {
      return;
    }
    if (
      kind !== 'equation'
      && index === 0
      && lines.length > 1
      && /^(считаем|делим|умножаем|складываем|вычитаем|получаем)\s*:/i.test(text)
      && /=/.test(text)
    ) {
      return;
    }
    if (/^(теперь считаем|получаем ответ|значит ответ|получаем:)$/i.test(text)) {
      return;
    }
    const key = text.toLowerCase().replace(/[.!?]+$/g, '');
    if (seen.has(key)) return;
    seen.add(key);
    cleaned.push(text);
  });

  return cleaned;
}

function buildDirectOperationExplanation(operation, explanationText) {
  const parsed = splitStructuredSections(explanationText);
  const answerValue = computeOperationAnswerValue(operation) || extractSectionValue(parsed.answerLine, /^Ответ:\s*/i);
  const bodyLines = buildOperationLeadLines(operation);
  const adviceText = defaultAdviceForOperation(operation);
  const metaLines = [];

  if (answerValue) {
    metaLines.push(`Ответ: ${ensureSentenceEnding(answerValue)}`);
  }
  metaLines.push(`Совет: ${ensureSentenceEnding(adviceText)}`);

  return {
    bodyLines,
    metaLines
  };
}

function prepareExplanationStructure(explanationText, operations, taskText) {
  const kind = inferExplanationKind(taskText);
  const directTaskOperation = extractSingleDirectOperation(taskText);
  const primaryOperation = operations.length === 1 ? operations[0] : directTaskOperation;
  const directArithmeticTask = Boolean(directTaskOperation) && !isEquationTask(taskText);

  if (directArithmeticTask) {
    return buildDirectOperationExplanation(directTaskOperation, explanationText);
  }

  const parsed = kind === 'expression' && operations.length > 1
    ? extractCompoundExpressionBodyLines(explanationText)
    : splitStructuredSections(explanationText);
  const bodyLines = kind === 'expression' && operations.length > 1
    ? parsed.bodyLines
    : cleanGenericBodyLines(parsed.bodyLines, kind, primaryOperation);
  const metaLines = [];

  if (kind === 'equation' && parsed.checkLine) {
    metaLines.push(parsed.checkLine);
  }

  if (parsed.answerLine) {
    metaLines.push(parsed.answerLine);
  }
  if (parsed.adviceLine) {
    metaLines.push(parsed.adviceLine);
  }

  if (!metaLines.some(line => /^Ответ:/i.test(line))) {
    const computed = primaryOperation ? computeOperationAnswerValue(primaryOperation) : '';
    metaLines.push(`Ответ: ${ensureSentenceEnding(computed || 'проверь запись задачи')}`);
  }

  if (!metaLines.some(line => /^Совет:/i.test(line))) {
    const fallbackAdvice = primaryOperation ? defaultAdviceForOperation(primaryOperation) : 'Решай по шагам и следи за каждым действием.';
    metaLines.push(`Совет: ${ensureSentenceEnding(fallbackAdvice)}`);
  }

  return {
    bodyLines,
    metaLines
  };
}

function lineItem(text, lineIndex) {
  return { text: String(text || '').trim(), lineIndex };
}

function renderOrderMarkersLine(item) {
  const line = String(item?.text || '').replace(/[.!?]+$/g, '');
  const attrs = typeof item?.lineIndex === 'number' ? ` data-result-line-index="${item.lineIndex}"` : '';
  const html = [...line].map(char => {
    if (/\d/.test(char)) {
      return `<span class="result-line-order__digit" style="color:${getStepColor(Number(char) - 1)};">${escapeHtml(char)}</span>`;
    }
    if (char === ' ') {
      return '&nbsp;';
    }
    return escapeHtml(char);
  }).join('');
  return `<p class="result-line result-line--order-markers"${attrs}>${html}</p>`;
}

function renderExplanationLine(item) {
  const line = item?.text || '';
  const safe = escapeHtml(line);
  const attrs = typeof item?.lineIndex === 'number' ? ` data-result-line-index="${item.lineIndex}"` : '';
  if (/^Ответ:/i.test(line)) {
    return `<div class="result-line result-line--answer"${attrs}>${safe}</div>`;
  }
  if (/^Совет:/i.test(line)) {
    return `<div class="result-line result-line--advice"${attrs}>${safe}</div>`;
  }
  if (/^Проверка:/i.test(line)) {
    return `<p class="result-line result-line--check"${attrs}>${safe}</p>`;
  }
  if (looksLikeOrderMarkersLine(line)) {
    return renderOrderMarkersLine(item);
  }
  if (/^(Порядок действий:?|Решение(?: по действиям)?[.:]?|Решение\.)$/i.test(line)) {
    return `<p class="result-line result-line--section"${attrs}>${safe}</p>`;
  }
  return `<p class="result-line"${attrs}>${safe}</p>`;
}

function renderExplanationItems(items) {
  if (!items.length) {
    return '<p class="result-line">Здесь появится объяснение и ответ.</p>';
  }

  return items.map(renderExplanationLine).join('');
}

function buildFlowItems(bodyLineItems, blocks) {
  const flowItems = [];
  const usedBlockIndexes = new Set();

  bodyLineItems.forEach(item => {
    let nextItem = item;
    if (/^\d+\)/.test(item.text)) {
      const blockIndex = blocks.findIndex((block, index) => !usedBlockIndexes.has(index) && lineMatchesOperation(item.text, block.operation));
      if (blockIndex >= 0) {
        const block = blocks[blockIndex];
        nextItem = { ...item, text: ensureStepLineHasResult(item.text, block.operation) };
        usedBlockIndexes.add(blockIndex);
        flowItems.push({ type: 'line', item: nextItem });
        flowItems.push({ type: 'block', block });
        return;
      }
    }
    flowItems.push({ type: 'line', item: nextItem });
  });

  blocks.forEach((block, index) => {
    if (!usedBlockIndexes.has(index)) {
      flowItems.push({ type: 'block', block });
    }
  });

  return flowItems;
}

function buildPreparedExplanationData({ explanationText, taskText }) {
  const operations = collectOperations(taskText, explanationText);
  const models = operations.map(operation => ({ operation, model: buildColumnModel(operation) }));
  const structure = prepareExplanationStructure(String(explanationText || ''), operations, taskText);

  let nextLineIndex = 0;
  const bodyLineItems = structure.bodyLines.map(text => lineItem(text, nextLineIndex++));
  const blocks = models.map(({ operation, model }) => {
    const titleLineIndex = nextLineIndex++;
    const noteItems = trimNotes(model.notes || [], 20).map(note => ({ ...note, lineIndex: nextLineIndex++ }));
    return {
      ...model,
      operation,
      titleLineIndex,
      noteItems
    };
  });
  const metaLineItems = structure.metaLines.map(text => lineItem(text, nextLineIndex++));
  const flowItems = buildFlowItems(bodyLineItems, blocks);

  const speechLines = [
    ...flowItems.flatMap(item => item.type === 'line'
      ? [item.item.text]
      : [item.block.title, ...item.block.noteItems.map(note => note.text)]),
    ...metaLineItems.map(item => item.text)
  ].filter(Boolean);

  const preparedExplanation = [
    ...flowItems.flatMap(item => item.type === 'line'
      ? [item.item.text]
      : [item.block.title, ...item.block.noteItems.map(note => note.text)]),
    ...metaLineItems.map(item => item.text)
  ].join('\n').trim();

  return {
    preparedExplanation,
    bodyLineItems,
    metaLineItems,
    blocks,
    flowItems,
    speechLines
  };
}

export function getPreparedExplanationText({ explanationText, taskText }) {
  return buildPreparedExplanationData({ explanationText, taskText }).preparedExplanation;
}

export function getPreparedSpeechLines({ explanationText, taskText }) {
  return buildPreparedExplanationData({ explanationText, taskText }).speechLines;
}

export function renderExplanationWithColumns({ explanationText, taskText }) {
  const data = buildPreparedExplanationData({ explanationText, taskText });
  const flowHtml = data.flowItems.length
    ? data.flowItems.map(item => item.type === 'line'
      ? renderExplanationLine(item.item)
      : renderColumnBlock(item.block)).join('')
    : '<p class="result-line">Здесь появится объяснение и ответ.</p>';

  const tailHtml = data.metaLineItems.length
    ? `
      <div class="result-text-flow result-text-flow--tail">
        ${renderExplanationItems(data.metaLineItems)}
      </div>
    `
    : '';

  return `
    <div class="result-rich-text">
      <div class="result-text-flow">
        ${flowHtml}
      </div>
      ${tailHtml}
    </div>
  `;
}
