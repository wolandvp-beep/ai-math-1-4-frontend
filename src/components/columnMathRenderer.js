import { escapeHtml, splitExplanationLines } from '../utils/text.js';

const DIGIT_COLORS = ['#c50e03', '#10a108', '#46c4e7', '#b590ea', '#318fbb', '#ff9800', '#949c18'];
const STEP_COLORS = ['#c50e03', '#10a108', '#254ea5', '#b590ea', '#318fbb', '#ff9800'];

const ACTION_PLACE_NAMES = ['единицы', 'десятки', 'сотни', 'тысячи', 'десятки тысяч', 'сотни тысяч'];
const UNDER_PLACE_NAMES = ['единицами', 'десятками', 'сотнями', 'тысячами', 'десятками тысяч', 'сотнями тысяч'];
const CARRY_PLACE_NAMES = ['десяток', 'сотню', 'тысячу', 'десяток тысяч', 'сотню тысяч', 'единицу следующего разряда'];

function actionPlaceName(index) {
  return ACTION_PLACE_NAMES[index] || 'следующий разряд';
}

function underPlaceName(index) {
  return UNDER_PLACE_NAMES[index] || 'следующим разрядом';
}

function carryPlaceName(index) {
  return CARRY_PLACE_NAMES[index] || 'единицу следующего разряда';
}

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

function isRoundNumberText(value) {
  return /^\d+0+$/.test(String(value || ''));
}

function shouldUseColumn(operation) {
  const leftText = String(operation?.a || '');
  const rightText = String(operation?.b || '');
  if (!/^\d+$/.test(leftText) || !/^\d+$/.test(rightText)) return false;

  const left = Number(leftText);
  const right = Number(rightText);
  const operator = normalizeOperator(operation?.operator || '');

  if (operator === '÷') {
    if (!right) return false;
    const quotient = Math.floor(left / right);
    const hasSingleDigitQuotient = Number.isFinite(quotient) && String(Math.max(quotient, 0)).length === 1;
    if (leftText.length <= 2 && rightText.length <= 2 && left % right === 0 && hasSingleDigitQuotient) {
      return false;
    }
    if (isRoundNumberText(leftText) && isRoundNumberText(rightText)) {
      return false;
    }
    return leftText.length >= 3 || rightText.length >= 2;
  }

  if (operator === '×') {
    if ((isRoundNumberText(leftText) || isRoundNumberText(rightText)) && Math.min(left, right) < 10) {
      return false;
    }
    if (Math.max(left, right) < 100 && Math.min(left, right) < 10) {
      return false;
    }
  }

  return leftText.length >= 2 || rightText.length >= 2;
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

function renderBlockShell({ title, titleLineIndex, notesTitleLineIndex, tableHtml, noteItems = [] }) {
  const titleAttrs = typeof titleLineIndex === 'number' ? ` data-result-line-index="${titleLineIndex}"` : '';
  const notesTitleAttrs = typeof notesTitleLineIndex === 'number' ? ` data-result-line-index="${notesTitleLineIndex}"` : '';
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
          <div class="column-notes-title"${notesTitleAttrs}>Пояснения</div>
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

function buildAdditionTeachingNotes(notes) {
  const source = trimNotes(notes).map(note => ({ ...note }));
  const normalized = [];
  let placeIndex = 0;

  source.forEach(note => {
    const raw = String(note.text || '').trim();
    let match = raw.match(/^(\d+)\s+пишем,\s+(\d+)\s+переносим$/i);
    if (match) {
      const writePlace = Math.max(placeIndex - 1, 0);
      normalized.push({
        ...note,
        text: `Записываем ${match[1]} под ${underPlaceName(writePlace)}, ${match[2]} ${carryPlaceName(writePlace)} запоминаем.`
      });
      return;
    }

    match = raw.match(/^(.+?)\s*=\s*(\d+)$/);
    if (match && /\+/.test(match[1])) {
      normalized.push({
        ...note,
        text: `Складываем ${actionPlaceName(placeIndex)}: ${match[1]} = ${match[2]}.`
      });
      placeIndex += 1;
      return;
    }

    normalized.push({ ...note, text: raw });
  });

  return trimNotes(normalized, 24);
}

function buildSubtractionTeachingNotes(notes) {
  const source = trimNotes(notes).map(note => ({ ...note }));
  const normalized = [];
  let placeIndex = 0;

  source.forEach(note => {
    const raw = String(note.text || '').trim();
    let match = raw.match(/^(.+?)\s+меньше\s+(.+?),\s+занимаем 1$/i);
    if (match) {
      normalized.push({
        ...note,
        text: `Из ${match[1]} вычесть ${match[2]} нельзя. Занимаем 1 ${carryPlaceName(placeIndex)}.`
      });
      return;
    }

    match = raw.match(/^(.+?)\s*=\s*(-?\d+)$/);
    if (match && /-/.test(match[1])) {
      normalized.push({
        ...note,
        text: `Вычитаем ${actionPlaceName(placeIndex)}: ${match[1]} = ${match[2]}.`
      });
      placeIndex += 1;
      return;
    }

    if (/^первое число меньше второго, ответ отрицательный\.?$/i.test(raw)) {
      normalized.push({ ...note, text: 'Первое число меньше второго, поэтому ответ будет отрицательным.' });
      return;
    }

    normalized.push({ ...note, text: raw });
  });

  return trimNotes(normalized, 24);
}

function buildMultiplicationTeachingNotes(notes) {
  const source = trimNotes(notes).map(note => ({ ...note }));
  const normalized = [];

  source.forEach(note => {
    const raw = String(note.text || '').trim();
    let match = raw.match(/^(\d+)\s*[×x]\s*(\d+)(?:\s*\+\s*(\d+))?\s*=\s*(\d+)$/i);
    if (match) {
      const carryPart = match[3] ? ` и прибавляем ${match[3]}` : '';
      normalized.push({
        ...note,
        text: `Умножаем ${match[1]} на ${match[2]}${carryPart}: получаем ${match[4]}.`
      });
      return;
    }

    match = raw.match(/^(\d+)\s+пишем,\s+(\d+)\s+переносим$/i);
    if (match) {
      normalized.push({
        ...note,
        text: `Записываем ${match[1]}, ${match[2]} переносим в следующий разряд.`
      });
      return;
    }

    match = raw.match(/^(\d+)\s+дописываем слева$/i);
    if (match) {
      normalized.push({ ...note, text: `Оставшийся перенос ${match[1]} дописываем слева.` });
      return;
    }

    normalized.push({ ...note, text: raw });
  });

  return trimNotes(normalized, 24);
}

function normalizeDivisionNotes(notes) {
  const trimmed = trimNotes(notes, 12);
  if (!trimmed.length) return [];

  const normalized = [];
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
        ? `Определяем первое неполное делимое. Это ${current}.`
        : `Определяем следующее неполное делимое. Это ${current}.`
    });

    normalized.push({
      ...note,
      text: nextTry > current
        ? `Делим ${current} на ${divisor}. Берём ${qDigit}, потому что ${qDigit} × ${divisor} = ${product}, а ${qDigit + 1} × ${divisor} = ${nextTry}, это уже больше.`
        : `Делим ${current} на ${divisor}. Берём ${qDigit}, потому что ${qDigit} × ${divisor} = ${product}.`
    });

    normalized.push({
      ...note,
      text: `Записываем ${qDigit} в частном и находим остаток: ${current} - ${product} = ${remainder}.`
    });

    if (remainder < divisor) {
      normalized.push({
        ...note,
        text: `Проверяем: остаток ${remainder} меньше делителя ${divisor}.`
      });
    }

    if (nextPayload) {
      normalized.push({
        ...note,
        text: `Сносим следующую цифру и получаем ${Number(nextPayload.current)}.`
      });
    } else if (remainder === 0) {
      normalized.push({ ...note, text: 'Деление закончено без остатка.' });
    } else {
      normalized.push({ ...note, text: `Деление закончено. Остаток ${remainder}.` });
    }
  });

  return trimNotes(normalized, 24);
}

function normalizeTeachingNotes(notes, operator) {
  if (operator === '+') return buildAdditionTeachingNotes(notes);
  if (operator === '-') return buildSubtractionTeachingNotes(notes);
  if (operator === '×') return buildMultiplicationTeachingNotes(notes);
  return normalizeDivisionNotes(notes);
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

  if (simpleDirectTask && !taskOperations.length) {
    return [];
  }

  if (hasNarrativeText(taskText) && !isDirectMathTask(taskText)) {
    return [];
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

function isDirectDivisionTask(taskText, primaryOperation) {
  if (!primaryOperation || primaryOperation.operator !== '÷') {
    return false;
  }

  const normalizedTask = String(taskText || '').trim();
  if (!normalizedTask) {
    return false;
  }

  return /^[\d\s:/÷/=?.]+$/.test(normalizedTask);
}

function compactDivisionExplanation(explanationText, primaryOperation, taskText) {
  if (!isDirectDivisionTask(taskText, primaryOperation)) {
    return explanationText;
  }

  const lines = String(explanationText || '')
    .split(/\n+/)
    .map(line => line.trim())
    .filter(Boolean);

  if (!lines.length) {
    return explanationText;
  }

  const kept = [];
  let hasEquation = false;
  let hasCheck = false;
  let hasAnswer = false;
  let hasAdvice = false;
  const equationFragments = [
    `${primaryOperation.a} : ${primaryOperation.b}`,
    `${primaryOperation.a}/${primaryOperation.b}`,
    `${primaryOperation.a} ÷ ${primaryOperation.b}`
  ];

  lines.forEach((line, index) => {
    const lower = line.toLowerCase();

    if (/^совет:/i.test(line)) {
      if (!hasAdvice) {
        kept.push(line);
        hasAdvice = true;
      }
      return;
    }

    if (/^проверка:/i.test(line)) {
      if (!hasCheck) {
        kept.push(line);
        hasCheck = true;
      }
      return;
    }

    if (/^ответ:/i.test(line)) {
      if (!hasAnswer) {
        kept.push(line);
        hasAnswer = true;
      }
      return;
    }

    const containsMainEquation = equationFragments.some(fragment => line.includes(fragment));
    if (containsMainEquation && /=/.test(line)) {
      if (!hasEquation) {
        kept.push(line);
        hasEquation = true;
      }
      return;
    }

    if (index === 0) {
      kept.push(line);
      return;
    }

    if (kept.length === 1 && /(делим|выполняем деление|нужно разделить|деление)/i.test(lower)) {
      kept.push(line);
      return;
    }

    if (/(сначала посмотрим|теперь смотрим|сколько раз|помещается|сносим|подходит|остаток|умножаем|вычитаем|следующую цифру|последнюю цифру|неполное делимое|подбираем)/i.test(lower)) {
      return;
    }
  });

  if (kept.length >= 3) {
    return kept.join('\n\n');
  }

  return explanationText;
}

function ensureSentenceEnding(text) {
  const value = String(text || '').trim();
  if (!value) return '';
  return /[.!?…]$/.test(value) ? value : `${value}.`;
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
  if (operation.operator === '+') return 'сначала складывай единицы, потом десятки';
  if (operation.operator === '-') return 'если цифры не хватает, занимаем 1 у соседнего разряда';
  if (operation.operator === '×') return 'умножай по разрядам справа налево';
  return 'в делении столбиком повторяй шаги: взял, подобрал, умножил, вычел';
}

function firstIncompleteDividendText(operation) {
  const dividend = Number(operation?.a);
  const divisor = Number(operation?.b);
  if (!Number.isFinite(dividend) || !Number.isFinite(divisor) || divisor <= 0) return '';

  let current = '';
  for (const digit of String(dividend)) {
    current += digit;
    if (Number(current) >= divisor) {
      return String(Number(current));
    }
  }

  return String(dividend);
}

function quotientDigitCount(operation) {
  const dividend = Number(operation?.a);
  const divisor = Number(operation?.b);
  if (!Number.isFinite(dividend) || !Number.isFinite(divisor) || divisor <= 0) return 0;
  const quotient = Math.floor(dividend / divisor);
  return String(Math.max(quotient, 0)).length;
}

function buildOperationLeadLines(operation) {
  const useColumn = shouldUseColumn(operation);
  const leftNumber = Number(operation.a);
  const rightNumber = Number(operation.b);

  if (operation.operator === '+') {
    if (!useColumn) {
      if (leftNumber < 10 && rightNumber < 10 && leftNumber + rightNumber >= 10) {
        return [
          'Нужно найти сумму.',
          'Удобно сначала дополнить число до 10, а потом прибавить остаток.'
        ];
      }
      if (leftNumber >= 10 && rightNumber >= 10) {
        return [
          'Нужно найти сумму.',
          'Представляем каждое число как сумму десятков и единиц.'
        ];
      }
      return ['Нужно найти сумму.', 'Складываем оба количества и получаем сумму.'];
    }
    return [
      'Нужно найти сумму.',
      'Записываем слагаемые столбиком: единицы под единицами, десятки под десятками.',
      'Складываем по разрядам, начиная с единиц.'
    ];
  }

  if (operation.operator === '-') {
    if (!useColumn) {
      if (leftNumber >= 10 && rightNumber < 10 && leftNumber % 10 < rightNumber) {
        return [
          'Нужно найти разность.',
          'Если единиц не хватает, удобно вычитать число по частям.'
        ];
      }
      return ['Нужно найти разность.', 'Смотрим, сколько нужно убрать из первого числа.'];
    }
    return [
      'Нужно найти разность.',
      'Записываем числа столбиком: единицы под единицами, десятки под десятками.',
      'Вычитаем по разрядам, начиная с единиц. Если цифры не хватает, занимаем 1 у соседнего разряда.'
    ];
  }

  if (operation.operator === '×') {
    if (!useColumn) {
      if ((leftNumber % 10 === 0 || rightNumber % 10 === 0) && Math.min(leftNumber, rightNumber) < 10) {
        return [
          'Нужно найти произведение.',
          'Круглое число удобно представить десятками или сотнями, а потом умножить.'
        ];
      }
      if (Math.max(leftNumber, rightNumber) >= 10 && Math.min(leftNumber, rightNumber) <= 10) {
        return [
          'Нужно найти произведение.',
          'Удобно разложить многозначное число на разрядные слагаемые и умножить каждую часть.'
        ];
      }
      return ['Нужно найти произведение.', 'Умножение можно понимать как сумму одинаковых слагаемых.'];
    }
    return [
      'Нужно найти произведение.',
      'Записываем множители столбиком.',
      'Сначала умножаем на единицы нижнего числа, потом, если нужно, складываем неполные произведения.'
    ];
  }

  if (rightNumber === 0) {
    return ['На ноль делить нельзя.'];
  }

  if (!useColumn) {
    if (leftNumber % 10 === 0 && rightNumber % 10 === 0) {
      return [
        'Нужно найти частное.',
        'У круглых чисел удобно сначала сократить одинаковые нули справа.'
      ];
    }
    if (rightNumber >= 10 && leftNumber < 1000) {
      return [
        'Нужно найти частное.',
        'Сначала подбираем число, которое при умножении на делитель даст делимое.'
      ];
    }
    return ['Нужно найти частное.', 'Деление связано с умножением, поэтому удобно проверять подбор.'];
  }

  const firstPart = firstIncompleteDividendText(operation);
  const digitCount = quotientDigitCount(operation);
  const digitWord = digitCount === 1 ? 'цифра' : (digitCount >= 2 && digitCount <= 4 ? 'цифры' : 'цифр');

  return [
    'Нужно найти частное.',
    `Определяем первое неполное делимое. Это ${firstPart}.`,
    `В частном будет ${digitCount} ${digitWord}.`,
    'Потом по шагам подбираем цифру частного, умножаем, вычитаем и сносим следующую цифру.'
  ];
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

function buildDirectOperationExplanation(operation, explanationText, taskText = '') {
  const parsed = splitStructuredSections(explanationText);
  const cleanedBody = cleanGenericBodyLines(parsed.bodyLines, inferExplanationKind(taskText || ''), operation);
  const answerValue = computeOperationAnswerValue(operation) || extractSectionValue(parsed.answerLine, /^Ответ:\s*/i);
  const useColumnMethod = shouldUseColumn(operation);
  const adviceText = useColumnMethod
    ? defaultAdviceForOperation(operation)
    : (extractSectionValue(parsed.adviceLine, /^Совет:\s*/i) || defaultAdviceForOperation(operation));

  let bodyLines = [];
  if (useColumnMethod) {
    bodyLines = buildOperationLeadLines(operation);
  } else if (cleanedBody.length) {
    bodyLines = cleanedBody.slice(0, 6);
  } else {
    bodyLines = buildOperationLeadLines(operation);
  }

  const metaLines = [];
  if (answerValue) {
    metaLines.push(`Ответ: ${ensureSentenceEnding(answerValue)}`);
  } else if (parsed.answerLine) {
    metaLines.push(parsed.answerLine);
  }

  metaLines.push(`Совет: ${ensureSentenceEnding(adviceText)}`);

  return {
    bodyLines,
    metaLines
  };
}

function prepareExplanationStructure(explanationText, operations, taskText) {
  const kind = inferExplanationKind(taskText);
  const primaryOperation = operations.length === 1 ? operations[0] : null;
  const directArithmeticTask = Boolean(primaryOperation) && isSimpleDirectOperationTask(taskText) && !isEquationTask(taskText);

  if (directArithmeticTask) {
    return buildDirectOperationExplanation(primaryOperation, explanationText, taskText);
  }

  const parsed = splitStructuredSections(explanationText);
  const bodyLines = cleanGenericBodyLines(parsed.bodyLines, kind, primaryOperation);
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
    const fallbackAdvice = primaryOperation ? defaultAdviceForOperation(primaryOperation) : 'решай по шагам и следи за каждым действием';
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
  return `<p class="result-line"${attrs}>${safe}</p>`;
}

function renderExplanationItems(items) {
  if (!items.length) {
    return '<p class="result-line">Здесь появится объяснение и ответ.</p>';
  }

  return items.map(renderExplanationLine).join('');
}

function buildPreparedExplanationData({ explanationText, taskText }) {
  const operations = collectOperations(taskText, explanationText);
  const models = operations.map(operation => ({ operation, model: buildColumnModel(operation) }));
  const structure = prepareExplanationStructure(String(explanationText || ''), operations, taskText);

  let nextLineIndex = 0;
  const bodyLineItems = structure.bodyLines.map(text => lineItem(text, nextLineIndex++));
  const blocks = models.map(({ operation, model }) => {
    const titleLineIndex = nextLineIndex++;
    const notesTitleLineIndex = nextLineIndex++;
    const noteItems = trimNotes(model.notes || [], 20).map(note => ({ ...note, lineIndex: nextLineIndex++ }));
    return {
      ...model,
      operation,
      titleLineIndex,
      notesTitleLineIndex,
      noteItems
    };
  });
  const metaLineItems = structure.metaLines.map(text => lineItem(text, nextLineIndex++));

  const speechLines = [
    ...bodyLineItems.map(item => item.text),
    ...blocks.flatMap(block => [block.title, 'Пояснения', ...block.noteItems.map(note => note.text)]),
    ...metaLineItems.map(item => item.text)
  ].filter(Boolean);

  const preparedExplanation = [...bodyLineItems, ...metaLineItems].map(item => item.text).join('\n').trim();

  return {
    preparedExplanation,
    bodyLineItems,
    metaLineItems,
    blocks,
    speechLines
  };
}

export function getPreparedExplanationText({ explanationText, taskText }) {
  const data = buildPreparedExplanationData({ explanationText, taskText });
  return [...data.bodyLineItems, ...data.metaLineItems].map(item => item.text).join('\n').trim();
}

export function getPreparedSpeechLines({ explanationText, taskText }) {
  return buildPreparedExplanationData({ explanationText, taskText }).speechLines;
}

export function renderExplanationWithColumns({ explanationText, taskText }) {
  const data = buildPreparedExplanationData({ explanationText, taskText });
  const blocksHtml = data.blocks.length
    ? `
      <div class="column-blocks">
        ${data.blocks.map(renderColumnBlock).join('')}
      </div>
    `
    : '';

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
        ${renderExplanationItems(data.bodyLineItems)}
      </div>
      ${blocksHtml}
      ${tailHtml}
    </div>
  `;
}
