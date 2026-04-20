import { escapeHtml, splitExplanationLines, looksLikeTechnicalMaintenancePayload } from '../utils/text.js';

const DIGIT_COLORS = ['#c50e03', '#10a108', '#46c4e7', '#b590ea', '#318fbb', '#ff9800', '#949c18'];
const STEP_COLORS = ['#c50e03', '#10a108', '#254ea5', '#b590ea', '#318fbb', '#ff9800', '#00897b', '#8e24aa', '#5d4037', '#0088cc'];
const ORDINAL_WORDS = { 1: 'Первое', 2: 'Второе', 3: 'Третье', 4: 'Четвертое', 5: 'Пятое', 6: 'Шестое', 7: 'Седьмое', 8: 'Восьмое', 9: 'Девятое', 10: 'Десятое' };

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
  if (!/^\d+$/.test(operation.a) || !/^\d+$/.test(operation.b)) {
    return false;
  }

  const aLength = String(operation.a).length;
  const bLength = String(operation.b).length;
  if (operation.operator === '×') {
    return aLength >= 2 || bLength >= 2;
  }
  if (operation.operator === '÷') {
    return aLength >= 3 || bLength >= 2;
  }
  return aLength >= 3 || bLength >= 3 || (aLength >= 2 && bLength >= 2);
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

function renderBlockShell({ title, titleLineIndex, tableHtml, noteItems = [], hideNotes = false, extraClass = '' }) {
  const titleAttrs = typeof titleLineIndex === 'number' ? ` data-result-line-index="${titleLineIndex}"` : '';
  const sectionClassName = ['column-card', extraClass].filter(Boolean).join(' ');
  const notesHtml = hideNotes
    ? ''
    : `
        <div class="column-notes">
          <div class="column-notes-title">Пояснения</div>
          ${renderNotes(noteItems)}
        </div>
      `;

  return `
    <section class="${sectionClassName}">
      <div class="column-card-head">
        <div class="column-card-title"${titleAttrs}>${escapeHtml(title)}</div>
      </div>
      <div class="column-card-body">
        <div class="column-visual-wrap">
          <div class="column-visual-scroll">
            ${tableHtml}
          </div>
        </div>
        ${notesHtml}
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

function compareWithDivisorText(candidate, divisor) {
  if (candidate < divisor) return `${candidate} меньше ${divisor} – не подходит`;
  if (candidate === divisor) return `${candidate} равно ${divisor} – подходит`;
  return `${candidate} больше ${divisor} – подходит`;
}

function buildFirstIncompleteDividendLead(operation, current) {
  const dividendText = String(operation?.a || '').replace(/\D/g, '');
  const divisorText = String(operation?.b || '').replace(/\D/g, '');
  const divisor = Number(divisorText);
  const firstCurrent = Number(current);

  if (!dividendText || !divisorText || !Number.isFinite(divisor) || divisor <= 0 || !Number.isFinite(firstCurrent) || firstCurrent <= 0) {
    return [
      'Определяем первое неполное делимое. Оно должно быть больше или равно делителю.',
      `Подобрали первое неполное делимое ${current}.`
    ];
  }

  const startLength = Math.min(dividendText.length, Math.max(1, divisorText.length));
  let prefixLength = startLength;
  let candidate = Number(dividendText.slice(0, prefixLength));
  const fragments = [];

  while (prefixLength < dividendText.length && candidate < divisor) {
    fragments.push(compareWithDivisorText(candidate, divisor));
    prefixLength += 1;
    candidate = Number(dividendText.slice(0, prefixLength));
  }

  if (!fragments.length || fragments[fragments.length - 1] !== compareWithDivisorText(candidate, divisor)) {
    fragments.push(compareWithDivisorText(candidate, divisor));
  }

  const leadLine = fragments.length
    ? `Определяем первое неполное делимое. Оно должно быть больше или равно делителю. Подбираем: ${fragments.join(', ')}.`
    : 'Определяем первое неполное делимое. Оно должно быть больше или равно делителю.';

  return [leadLine, `Подобрали первое неполное делимое ${current}.`];
}

function normalizeDivisionNotes(notes, operation) {
  const trimmed = trimNotes(notes, 12);
  if (!trimmed.length) return [];

  const normalized = [];
  const firstPayload = parseDivisionNotePayload(trimmed[0].text);

  if (firstPayload) {
    buildFirstIncompleteDividendLead(operation, firstPayload.current).forEach(text => {
      normalized.push({ ...trimmed[0], text });
    });
  } else {
    normalized.push({
      ...trimmed[0],
      text: 'Определяем первое неполное делимое. Оно должно быть больше или равно делителю.'
    });
  }

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

    if (index > 0) {
      normalized.push({
        ...note,
        text: `Теперь работаем с числом ${current}.`
      });
    }

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

function normalizeTeachingNotes(notes, operator, operation = null) {
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
  return normalizeDivisionNotes(source, operation);
}

function decorateColumnModel(model, operation) {
  return {
    ...model,
    title: formatMethodTitle(operation.operator),
    inlineText: '',
    notes: normalizeTeachingNotes(model.notes || [], operation.operator, operation)
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

function formatOrderGuideToken(token) {
  if (!token) return '';
  if (token.type === '*') return '×';
  if (token.type === '/') return '÷';
  return token.value;
}

function getOrderGuideTokenSpan(token) {
  if (!token) return 1;
  if (token.type === 'number') return String(token.value || '').length || 1;
  return 1;
}

function getOrderGuideColumnCount(tokens) {
  return (tokens || []).reduce((sum, token) => sum + getOrderGuideTokenSpan(token), 0);
}

function isOrderGuideBreakableToken(token) {
  return Boolean(token) && ['+', '-', '*', '/'].includes(token.type);
}

function findPreferredOrderGuideBreakIndex(tokens) {
  const source = Array.isArray(tokens) ? tokens : [];
  if (source.length < 2) return -1;

  let depth = 0;
  let lastTopLevelAddSub = -1;
  let lastTopLevelMulDiv = -1;
  let lastAnyOperator = -1;

  source.forEach((token, index) => {
    if (token.type === ')') {
      depth = Math.max(0, depth - 1);
    }

    if (isOrderGuideBreakableToken(token)) {
      lastAnyOperator = index;
      if (depth === 0) {
        if (token.type === '+' || token.type === '-') lastTopLevelAddSub = index;
        else lastTopLevelMulDiv = index;
      }
    }

    if (token.type === '(') {
      depth += 1;
    }
  });

  if (lastTopLevelAddSub > 0) return lastTopLevelAddSub;
  if (lastTopLevelMulDiv > 0) return lastTopLevelMulDiv;
  if (lastAnyOperator > 0) return lastAnyOperator;
  return -1;
}

function segmentOrderGuideTokens(tokens, maxColumns = 18) {
  const source = Array.isArray(tokens) ? tokens : [];
  if (!source.length) return [];

  const segments = [];
  let currentTokens = [];
  let currentColumns = 0;

  const flush = () => {
    if (!currentTokens.length) return;
    segments.push({
      tokens: currentTokens,
      columns: currentColumns
    });
    currentTokens = [];
    currentColumns = 0;
  };

  source.forEach(token => {
    currentTokens.push(token);
    currentColumns += getOrderGuideTokenSpan(token);

    while (currentColumns > maxColumns && currentTokens.length > 1) {
      const breakIndex = findPreferredOrderGuideBreakIndex(currentTokens);

      if (breakIndex <= 0) {
        const overflowToken = currentTokens.pop();
        currentColumns -= getOrderGuideTokenSpan(overflowToken);
        flush();
        currentTokens = [overflowToken];
        currentColumns = getOrderGuideTokenSpan(overflowToken);
        break;
      }

      const nextTokens = currentTokens.slice(breakIndex);
      const keptTokens = currentTokens.slice(0, breakIndex);

      if (!keptTokens.length) {
        const overflowToken = currentTokens.pop();
        currentColumns -= getOrderGuideTokenSpan(overflowToken);
        flush();
        currentTokens = [overflowToken];
        currentColumns = getOrderGuideTokenSpan(overflowToken);
        break;
      }

      currentTokens = keptTokens;
      currentColumns = getOrderGuideColumnCount(currentTokens);
      flush();
      currentTokens = nextTokens;
      currentColumns = getOrderGuideColumnCount(currentTokens);
    }
  });

  flush();
  return segments;
}

function getOrderGuideTableSizeClass(columnCount) {
  if (columnCount > 16) return 'order-guide-table--tiny';
  if (columnCount > 11) return 'order-guide-table--compact';
  return '';
}

function renderOrderGuideSegment(segmentTokens, stepByOperatorIndex, options = {}) {
  const columnCount = getOrderGuideColumnCount(segmentTokens);
  const tableClass = ['column-table', 'order-guide-table', getOrderGuideTableSizeClass(columnCount), options.extraClass || '']
    .filter(Boolean)
    .join(' ');

  const markerCellsHtml = segmentTokens.map(token => {
    const span = getOrderGuideTokenSpan(token);
    const stepNumber = ['+', '-', '*', '/'].includes(token.type) ? (stepByOperatorIndex.get(token.index) || '') : '';
    const style = stepNumber ? ` style="color:${getStepColor(stepNumber - 1)};"` : '';
    const classes = [
      'order-guide-cell',
      'order-guide-marker-cell',
      stepNumber ? '' : 'order-guide-marker-cell--empty'
    ].filter(Boolean).join(' ');
    return `<td class="${classes}" colspan="${span}"${style}>${stepNumber ? escapeHtml(String(stepNumber)) : '&nbsp;'}</td>`;
  }).join('');

  const expressionCellsHtml = segmentTokens.map(token => {
    const span = getOrderGuideTokenSpan(token);
    const stepNumber = ['+', '-', '*', '/'].includes(token.type) ? (stepByOperatorIndex.get(token.index) || 0) : 0;
    const colorStyle = stepNumber ? ` style="--order-step-color:${getStepColor(stepNumber - 1)};"` : '';
    const classes = [
      'order-guide-cell',
      'order-guide-expression-cell',
      token.type === 'number' ? 'order-guide-expression-cell--number' : '',
      ['+', '-', '*', '/'].includes(token.type) ? 'order-guide-expression-cell--operator' : '',
      ['(', ')'].includes(token.type) ? 'order-guide-expression-cell--paren' : ''
    ].filter(Boolean).join(' ');
    return `<td class="${classes}" colspan="${span}"${colorStyle}>${escapeHtml(formatOrderGuideToken(token))}</td>`;
  }).join('');

  return `
    <table class="${tableClass}" aria-label="Порядок действий">
      <tbody>
        <tr class="order-guide-row order-guide-row--markers">${markerCellsHtml}</tr>
        <tr class="order-guide-row order-guide-row--expression">${expressionCellsHtml}</tr>
      </tbody>
    </table>
  `;
}

function buildOrderGuideExpressionState(taskText) {
  const normalizedTask = String(taskText || '').trim();
  if (!normalizedTask) return null;

  const fractionSource = isLikelyFractionExpression(normalizedTask) ? toSafeFractionExpressionSource(normalizedTask) : '';
  const fractionTokens = fractionSource ? tokenizeFractionExpression(fractionSource) : [];
  const plainSource = fractionTokens.length ? '' : toSafeExpressionSource(normalizedTask);
  const plainTokens = fractionTokens.length ? [] : tokenizeExpression(plainSource);
  const tokens = fractionTokens.length ? fractionTokens : plainTokens;

  if (!tokens.length) return null;

  const operatorPositions = new Map();
  let prettyExpression = '';

  tokens.forEach(token => {
    if (['+', '-', '*', '/'].includes(token.type)) {
      const prettyChar = token.type === '*' ? '×' : token.type === '/' ? '÷' : token.value;
      operatorPositions.set(token.index, prettyExpression.length + 1);
      prettyExpression += ` ${prettyChar} `;
      return;
    }
    prettyExpression += formatOrderGuideToken(token);
  });

  return {
    tokens,
    prettyExpression,
    operatorPositions
  };
}

function buildOrderGuidePreparedLines(taskText, operations) {
  const state = buildOrderGuideExpressionState(taskText);
  if (!state || !operations.length) return [];

  const marks = Array.from({ length: state.prettyExpression.length }, () => ' ');
  operations.forEach((operation, index) => {
    const prettyPos = state.operatorPositions.get(operation.index);
    if (typeof prettyPos !== 'number') return;
    const label = String(index + 1);
    const start = Math.max(0, prettyPos - Math.floor((label.length - 1) / 2));
    [...label].forEach((char, offset) => {
      const target = start + offset;
      if (target >= 0 && target < marks.length) {
        marks[target] = char;
      }
    });
  });

  return ['Порядок действий:', marks.join('').replace(/\s+$/g, ''), state.prettyExpression];
}

function buildOrderGuideBlock(taskText, operations, lineRefs = {}) {
  const state = buildOrderGuideExpressionState(taskText);
  if (!state || operations.length < 2) return null;

  const stepByOperatorIndex = new Map();
  operations.forEach((operation, index) => {
    if (typeof operation.index === 'number') {
      stepByOperatorIndex.set(operation.index, index + 1);
    }
  });

  const totalColumns = getOrderGuideColumnCount(state.tokens);
  const maxColumnsPerRow = totalColumns > 28 ? 11 : totalColumns > 22 ? 12 : totalColumns > 15 ? 13 : totalColumns;
  const shouldWrap = totalColumns > 15;
  const segments = shouldWrap ? segmentOrderGuideTokens(state.tokens, maxColumnsPerRow) : [{ tokens: state.tokens, columns: totalColumns }];
  const stackClass = segments.length > 1 ? 'order-guide-stack order-guide-stack--wrapped' : 'order-guide-stack';
  const tablesHtml = segments.map((segment, index) => renderOrderGuideSegment(segment.tokens, stepByOperatorIndex, {
    extraClass: segments.length > 1 && index > 0 ? 'order-guide-table--continued' : ''
  })).join('');

  return {
    title: 'Порядок действий',
    titleLineIndex: lineRefs.titleLineIndex,
    hideNotes: true,
    extraClass: 'order-guide-card',
    preparedLines: buildOrderGuidePreparedLines(taskText, operations),
    speechLines: ['Порядок действий.'],
    tableHtml: `
      <div class="${stackClass}">
        ${tablesHtml}
      </div>
    `
  };
}

function renderOrderGuideBlock(block) {
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


function insertImplicitMultiplication(source) {
  let normalized = String(source || '');
  if (!normalized) return normalized;
  normalized = normalized
    .replace(/(\d)\s*(\()/g, '$1*$2')
    .replace(/(\))\s*(\d)/g, '$1*$2')
    .replace(/(\))\s*(\()/g, '$1*$2');
  return normalized;
}


function toSafeFractionExpressionSource(taskText) {
  const source = insertImplicitMultiplication(
    String(taskText || '')
      .replace(/[−–]/g, '-')
      .replace(/[xXхХ×·]/g, '*')
      .replace(/[÷:]/g, '/')
      .replace(/\s+/g, '')
  );

  if (!source) return '';
  if (/[A-Za-zА-Яа-яЁё]/.test(source)) return '';
  if (/[^0-9+\-*/()]/.test(source)) return '';
  return source;
}


function makeRationalValue(numerator, denominator = 1) {
  const rawNumerator = Number(numerator);
  const rawDenominator = Number(denominator);
  if (!Number.isFinite(rawNumerator) || !Number.isFinite(rawDenominator) || rawDenominator === 0) {
    return null;
  }
  const sign = rawDenominator < 0 ? -1 : 1;
  const normalizedNumerator = rawNumerator * sign;
  const normalizedDenominator = Math.abs(rawDenominator);
  const divisor = gcdInt(normalizedNumerator, normalizedDenominator);
  return {
    numerator: normalizedNumerator / divisor,
    denominator: normalizedDenominator / divisor
  };
}

function formatRationalValue(value, forceFraction = false) {
  if (!value) return '';
  if (!forceFraction && value.denominator === 1) {
    return String(value.numerator);
  }
  return `${value.numerator}/${value.denominator}`;
}

function applyRationalOperator(operator, left, right) {
  if (!left || !right) return null;
  if (operator === '+') {
    return makeRationalValue(
      left.numerator * right.denominator + right.numerator * left.denominator,
      left.denominator * right.denominator
    );
  }
  if (operator === '-') {
    return makeRationalValue(
      left.numerator * right.denominator - right.numerator * left.denominator,
      left.denominator * right.denominator
    );
  }
  if (operator === '*') {
    return makeRationalValue(left.numerator * right.numerator, left.denominator * right.denominator);
  }
  if (right.numerator === 0) return null;
  return makeRationalValue(left.numerator * right.denominator, left.denominator * right.numerator);
}

function buildMixedFractionFromRational(value) {
  if (!value || value.denominator === 1 || Math.abs(value.numerator) < value.denominator) return null;
  const sign = value.numerator < 0 ? -1 : 1;
  const absoluteNumerator = Math.abs(value.numerator);
  const whole = Math.floor(absoluteNumerator / value.denominator) * sign;
  const remainder = absoluteNumerator % value.denominator;
  if (!remainder) return null;
  return {
    whole,
    numerator: remainder,
    denominator: value.denominator
  };
}

function tokenizeFractionExpression(source) {
  const prepared = String(source || '').trim();
  if (!prepared) return [];

  const tokens = [];
  let index = 0;

  while (index < prepared.length) {
    const char = prepared[index];
    if (/\d/.test(char)) {
      const start = index;
      let end = index + 1;
      while (end < prepared.length && /\d/.test(prepared[end])) end += 1;
      const integerText = prepared.slice(start, end);
      if (prepared[end] === '/' && /\d/.test(prepared[end + 1] || '')) {
        let denominatorEnd = end + 2;
        while (denominatorEnd < prepared.length && /\d/.test(prepared[denominatorEnd])) denominatorEnd += 1;
        const denominatorText = prepared.slice(end + 1, denominatorEnd);
        const rational = makeRationalValue(Number(integerText), Number(denominatorText));
        if (!rational) return [];
        tokens.push({ type: 'number', value: `${integerText}/${denominatorText}`, rational, index: start });
        index = denominatorEnd;
        continue;
      }
      const rational = makeRationalValue(Number(integerText), 1);
      if (!rational) return [];
      tokens.push({ type: 'number', value: integerText, rational, index: start });
      index = end;
      continue;
    }

    if ('+-*/()'.includes(char)) {
      tokens.push({ type: char, value: char, index });
      index += 1;
      continue;
    }

    return [];
  }

  const withImplicitMultiplication = [];
  let previous = null;
  tokens.forEach(token => {
    if (previous && ['number', ')'].includes(previous.type) && ['number', '('].includes(token.type)) {
      withImplicitMultiplication.push({ type: '*', value: '*', index: token.index - 0.5 });
    }
    withImplicitMultiplication.push(token);
    previous = token;
  });

  return withImplicitMultiplication;
}

function parseFractionExpressionAstFromSource(source) {
  const tokens = tokenizeFractionExpression(source);
  if (!tokens.length) return null;

  let cursor = 0;
  let nodeCounter = 1;
  const peek = () => tokens[cursor] || null;
  const consume = expected => {
    const token = peek();
    if (!token || (expected && token.type !== expected)) return null;
    cursor += 1;
    return token;
  };

  function parsePrimary() {
    const token = peek();
    if (!token) return null;

    if (token.type === 'number') {
      consume('number');
      return {
        type: 'number',
        value: token.rational,
        text: token.value,
        index: token.index
      };
    }

    if (token.type === '(') {
      const openToken = consume('(');
      const inner = parseAddSub();
      if (!inner || !consume(')')) return null;
      return {
        type: 'group',
        inner,
        index: openToken.index
      };
    }

    if (token.type === '+' || token.type === '-') {
      consume(token.type);
      const operand = parsePrimary();
      if (!operand) return null;
      return {
        type: 'unary',
        operator: token.type,
        operand,
        index: token.index
      };
    }

    return null;
  }

  function makeBinary(token, left, right) {
    const node = {
      type: 'binary',
      operator: token.type,
      left,
      right,
      index: token.index,
      id: nodeCounter
    };
    nodeCounter += 1;
    return node;
  }

  function parseMulDiv() {
    let node = parsePrimary();
    if (!node) return null;
    while (true) {
      const token = peek();
      if (!token || !['*', '/'].includes(token.type)) break;
      consume(token.type);
      const right = parsePrimary();
      if (!right) return null;
      node = makeBinary(token, node, right);
    }
    return node;
  }

  function parseAddSub() {
    let node = parseMulDiv();
    if (!node) return null;
    while (true) {
      const token = peek();
      if (!token || !['+', '-'].includes(token.type)) break;
      consume(token.type);
      const right = parseMulDiv();
      if (!right) return null;
      node = makeBinary(token, node, right);
    }
    return node;
  }

  const ast = parseAddSub();
  if (!ast || cursor !== tokens.length) return null;
  return ast;
}

function parseFractionExpressionAstFromTask(taskText) {
  const source = toSafeFractionExpressionSource(taskText);
  if (!source) return null;
  return parseFractionExpressionAstFromSource(source);
}

function evaluateFractionExpressionAst(node, steps = []) {
  if (!node) return null;
  if (node.type === 'number') return node.value;
  if (node.type === 'group') return evaluateFractionExpressionAst(node.inner, steps);
  if (node.type === 'unary') {
    const operand = evaluateFractionExpressionAst(node.operand, steps);
    if (!operand) return null;
    return node.operator === '-' ? makeRationalValue(-operand.numerator, operand.denominator) : operand;
  }
  const left = evaluateFractionExpressionAst(node.left, steps);
  const right = evaluateFractionExpressionAst(node.right, steps);
  const result = applyRationalOperator(node.operator, left, right);
  if (!result) return null;
  steps.push({
    id: node.id,
    operator: node.operator,
    left,
    right,
    result,
    index: node.index
  });
  return result;
}

function fractionOperatorSymbol(operator) {
  if (operator === '*') return '×';
  if (operator === '/') return '÷';
  return operator;
}

function fractionExpressionPrecedence(operator) {
  return ['+', '-'].includes(operator) ? 1 : 2;
}

function renderFractionExpressionNode(node, solved = new Map(), parentPrecedence = 0, isRightChild = false) {
  if (!node) return '';
  if (node.type === 'number') {
    return node.text || formatRationalValue(node.value);
  }
  if (node.type === 'group') {
    return `(${renderFractionExpressionNode(node.inner, solved)})`;
  }
  if (node.type === 'unary') {
    const inner = renderFractionExpressionNode(node.operand, solved, 3, false);
    return node.operator === '-' ? `-${inner}` : inner;
  }
  if (node.type === 'binary') {
    if (solved.has(node.id)) {
      return solved.get(node.id);
    }
    const precedence = fractionExpressionPrecedence(node.operator);
    const leftText = renderFractionExpressionNode(node.left, solved, precedence, false);
    const rightText = renderFractionExpressionNode(node.right, solved, precedence, true);
    const text = `${leftText} ${fractionOperatorSymbol(node.operator)} ${rightText}`;
    const needsBrackets = precedence < parentPrecedence || (isRightChild && ['+', '-'].includes(node.operator) && precedence === parentPrecedence);
    return needsBrackets ? `(${text})` : text;
  }
  return '';
}

function buildExpandedFractionStepText(step) {
  if (!step || !['+', '-'].includes(step.operator)) return '';
  const left = step.left;
  const right = step.right;
  if (!left || !right) return '';
  const common = lcmInt(left.denominator, right.denominator);
  if (!common || (left.denominator === common && right.denominator === common)) return '';
  const leftMultiplier = common / left.denominator;
  const rightMultiplier = common / right.denominator;
  if (!Number.isInteger(leftMultiplier) || !Number.isInteger(rightMultiplier)) return '';
  const leftScaled = left.numerator * leftMultiplier;
  const rightScaled = right.numerator * rightMultiplier;
  return `${leftScaled}/${common} ${step.operator} ${rightScaled}/${common}`;
}

function buildDetailedFractionAnswerText(taskText) {
  const ast = parseFractionExpressionAstFromTask(taskText);
  if (!ast) return '';
  const steps = [];
  const result = evaluateFractionExpressionAst(ast, steps);
  if (!result || !steps.length) return '';

  const solved = new Map();
  const chain = [renderFractionExpressionNode(ast, solved)];
  steps.forEach(step => {
    const expanded = buildExpandedFractionStepText(step);
    if (expanded) {
      solved.set(step.id, expanded);
      const expandedText = renderFractionExpressionNode(ast, solved);
      if (expandedText && expandedText !== chain[chain.length - 1]) {
        chain.push(expandedText);
      }
    }
    solved.set(step.id, formatRationalValue(step.result));
    const current = renderFractionExpressionNode(ast, solved);
    if (current && current !== chain[chain.length - 1]) {
      chain.push(current);
    }
  });

  const mixed = buildMixedFractionFromRational(result);
  if (mixed) {
    const mixedText = `${mixed.whole} ${mixed.numerator}/${mixed.denominator}`;
    if (mixedText !== chain[chain.length - 1]) {
      chain.push(mixedText);
    }
  }

  return chain.join(' = ');
}

function extractFractionExpressionEvaluationOperations(taskText) {
  const ast = parseFractionExpressionAstFromTask(taskText);
  if (!ast) return [];
  const steps = [];
  const result = evaluateFractionExpressionAst(ast, steps);
  if (!result || !steps.length) return [];
  return steps.map(step => ({
    a: formatRationalValue(step.left),
    b: formatRationalValue(step.right),
    operator: fractionOperatorSymbol(step.operator),
    index: step.index,
    result: formatRationalValue(step.result)
  }));
}

function isLikelyFractionExpression(taskText) {
  const source = toSafeFractionExpressionSource(taskText);
  if (!source) return false;
  const fractionMatches = [...source.matchAll(/(\d+)\/(\d+)/g)];
  if (!fractionMatches.length) return false;
  if (/^\d+\/\d+$/.test(source)) return false;

  const numbers = (source.match(/\d+/g) || []).map(Number).filter(Number.isFinite);
  if (!numbers.length) return false;
  if (Math.max(...numbers.map(value => Math.abs(value))) > 1000) return false;

  const placeholder = source.replace(/\d+\/\d+/g, 'F');
  if (!/^[F0-9+\-*/()]+$/.test(placeholder)) return false;
  if (placeholder === 'F') return false;

  if (fractionMatches.length === 1) {
    const numerator = Number(fractionMatches[0][1]);
    const denominator = Number(fractionMatches[0][2]);
    if (!/[+\-*()]/.test(placeholder)) return false;
    if (Math.max(Math.abs(numerator), Math.abs(denominator)) > 50) return false;
  }

  return true;
}

function toSafeExpressionSource(taskText) {
  const source = insertImplicitMultiplication(
    String(taskText || '')
      .replace(/[−–]/g, '-')
      .replace(/[xXхХ×]/g, '*')
      .replace(/[÷:]/g, '/')
      .replace(/\s+/g, '')
  );

  if (!source) return '';
  if (/[^0-9+\-*/()]/.test(source)) return '';
  if (!/\d/.test(source) || !/[+\-*/]/.test(source)) return '';
  return source;
}

function tokenizeExpression(source) {
  const tokens = [];

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (/\d/.test(char)) {
      let end = index + 1;
      while (end < source.length && /\d/.test(source[end])) {
        end += 1;
      }
      tokens.push({ type: 'number', value: source.slice(index, end), index });
      index = end - 1;
      continue;
    }

    if ('+-*/()'.includes(char)) {
      tokens.push({ type: char, value: char, index });
      continue;
    }

    return [];
  }

  return tokens;
}

function parseExpressionAstFromTask(taskText) {
  const source = toSafeExpressionSource(taskText);
  if (!source) return null;

  const tokens = tokenizeExpression(source);
  if (!tokens.length) return null;

  let cursor = 0;
  const peek = () => tokens[cursor] || null;
  const consume = expectedType => {
    const token = peek();
    if (!token || (expectedType && token.type !== expectedType)) {
      return null;
    }
    cursor += 1;
    return token;
  };

  function parsePrimary() {
    const token = peek();
    if (!token) return null;

    if (token.type === 'number') {
      consume('number');
      return { type: 'number', value: token.value, index: token.index };
    }

    if (token.type === '(') {
      consume('(');
      const inner = parseAddSub();
      if (!inner || !consume(')')) {
        return null;
      }
      return inner;
    }

    if (token.type === '+' || token.type === '-') {
      consume(token.type);
      const operand = parsePrimary();
      if (!operand) return null;
      if (token.type === '+') return operand;
      return { type: 'unary', operator: '-', operand, index: token.index };
    }

    return null;
  }

  function parseMulDiv() {
    let node = parsePrimary();
    if (!node) return null;

    while (true) {
      const token = peek();
      if (!token || !['*', '/'].includes(token.type)) {
        break;
      }
      consume(token.type);
      const right = parsePrimary();
      if (!right) return null;
      node = {
        type: 'binary',
        operator: token.type,
        left: node,
        right,
        index: token.index
      };
    }

    return node;
  }

  function parseAddSub() {
    let node = parseMulDiv();
    if (!node) return null;

    while (true) {
      const token = peek();
      if (!token || !['+', '-'].includes(token.type)) {
        break;
      }
      consume(token.type);
      const right = parseMulDiv();
      if (!right) return null;
      node = {
        type: 'binary',
        operator: token.type,
        left: node,
        right,
        index: token.index
      };
    }

    return node;
  }

  const ast = parseAddSub();
  if (!ast || cursor !== tokens.length) {
    return null;
  }
  return ast;
}

function formatStepValue(value) {
  if (!Number.isFinite(value)) return '';
  if (Math.abs(value - Math.round(value)) < 1e-9) {
    return String(Math.round(value));
  }
  return String(Number(value.toFixed(6)))
    .replace(/\.0+$/g, '')
    .replace(/(\.\d*?)0+$/g, '$1');
}

function applyParsedOperator(operator, left, right) {
  if (operator === '+') return left + right;
  if (operator === '-') return left - right;
  if (operator === '*') return left * right;
  if (right === 0) return Number.NaN;
  return left / right;
}

function getExpressionStepDepth(source, index) {
  if (typeof index !== 'number' || index < 0) return 0;
  let depth = 0;
  for (let cursor = 0; cursor < source.length && cursor < index; cursor += 1) {
    const char = source[cursor];
    if (char === '(') depth += 1;
    else if (char === ')' && depth > 0) depth -= 1;
  }
  return depth;
}

function getExpressionStepPrecedence(operator) {
  return operator === '×' || operator === '÷' ? 0 : 1;
}

function sortExpressionEvaluationOperations(operations, source) {
  return [...(operations || [])].sort((left, right) => {
    const leftDepth = getExpressionStepDepth(source, left?.index);
    const rightDepth = getExpressionStepDepth(source, right?.index);
    if (leftDepth !== rightDepth) return rightDepth - leftDepth;

    const leftPrecedence = getExpressionStepPrecedence(left?.operator);
    const rightPrecedence = getExpressionStepPrecedence(right?.operator);
    if (leftPrecedence !== rightPrecedence) return leftPrecedence - rightPrecedence;

    const leftIndex = typeof left?.index === 'number' ? left.index : Number.MAX_SAFE_INTEGER;
    const rightIndex = typeof right?.index === 'number' ? right.index : Number.MAX_SAFE_INTEGER;
    return leftIndex - rightIndex;
  });
}

function flattenSchoolChain(node, operatorsToFlatten, operands, operators) {
  if (node?.type === 'binary' && operatorsToFlatten.includes(node.operator)) {
    flattenSchoolChain(node.left, operatorsToFlatten, operands, operators);
    operators.push({ operator: node.operator, index: node.index });
    operands.push(node.right);
    return;
  }
  operands.push(node);
}

function pushEvaluatedStep(steps, left, operator, right, index) {
  steps.push({
    a: formatStepValue(left),
    b: formatStepValue(right),
    operator: operator === '*' ? '×' : operator === '/' ? '÷' : operator,
    index
  });
}

function evaluateParsedExpressionAst(node, steps) {
  if (!node) return Number.NaN;

  if (node.type === 'number') {
    return Number(node.value);
  }

  if (node.type === 'unary') {
    const operand = evaluateParsedExpressionAst(node.operand, steps);
    if (!Number.isFinite(operand)) return Number.NaN;
    return node.operator === '-' ? -operand : operand;
  }

  const chainOperators = ['+', '-'].includes(node.operator) ? ['+', '-'] : ['*', '/'];
  const operands = [];
  const operators = [];
  flattenSchoolChain(node, chainOperators, operands, operators);

  const values = operands.map(operand => evaluateParsedExpressionAst(operand, steps));
  if (values.some(value => !Number.isFinite(value))) {
    return Number.NaN;
  }

  let current = values[0];
  for (let index = 0; index < operators.length; index += 1) {
    const operatorEntry = operators[index];
    const operator = typeof operatorEntry === 'string' ? operatorEntry : operatorEntry.operator;
    const operatorIndex = typeof operatorEntry === 'string' ? index : operatorEntry.index;
    const right = values[index + 1];
    const result = applyParsedOperator(operator, current, right);
    if (!Number.isFinite(result)) {
      return Number.NaN;
    }
    pushEvaluatedStep(steps, current, operator, right, operatorIndex);
    current = result;
  }

  return current;
}

function extractExpressionEvaluationOperations(taskText) {
  const source = toSafeExpressionSource(taskText);
  if (!source) return [];

  const ast = parseExpressionAstFromTask(taskText);
  if (!ast) return [];

  const steps = [];
  const finalValue = evaluateParsedExpressionAst(ast, steps);
  if (!Number.isFinite(finalValue)) {
    return [];
  }

  return sortExpressionEvaluationOperations(
    steps.filter(step => step.a && step.b),
    source
  );
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
  const normalizedExplanation = String(explanationText || '').trim();
  if (/^Ошибка:\s*/i.test(normalizedExplanation) && !looksLikeTechnicalMaintenanceText(normalizedExplanation)) {
    return [];
  }

  const normalizedTask = String(taskText || '').trim();
  if (isEquationTask(normalizedTask)) {
    return [];
  }
  if (isLikelyFractionExpression(normalizedTask) || /\d+\s*\/\s*\d+\s*[+\-]\s*\d+\s*\/\s*\d+/i.test(normalizedTask)) {
    return extractFractionExpressionEvaluationOperations(normalizedTask);
  }

  const taskOperations = dedupeOperations(extractOperations(taskText));
  const simpleDirectTask = isSimpleDirectOperationTask(normalizedTask);
  if (taskOperations.length && simpleDirectTask) {
    return taskOperations;
  }

  const evaluatedTaskOperations = !simpleDirectTask ? extractExpressionEvaluationOperations(normalizedTask) : [];
  if (evaluatedTaskOperations.length > 1) {
    return evaluatedTaskOperations;
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
  if (!value) return false;
  if (!/^[\dA-Za-zА-Яа-я\s()+\-×÷:/*=.]+$/.test(value)) return false;
  if (!/[+\-×÷:/*=]/.test(value)) return false;
  const tokens = value.split(/[\s()+\-×÷:/*=]+/).filter(Boolean);
  if (!tokens.length) return false;
  return tokens.every(token => /^\d+$/.test(token) || /^[A-Za-zА-Яа-я]$/.test(token));
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
  const source = String(text || '').replace(/\s+$/g, '');
  const value = source.trim();
  if (!value) return '';
  if (looksLikeOrderMarkersLine(value) || looksLikePureMathLine(value)) return source;
  if (/[.!?…:]$/.test(value)) return value;
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
  if (isLikelyFractionExpression(text) || /\d+\s*\/\s*\d+\s*[+\-]\s*\d+\s*\/\s*\d+/i.test(text)) return 'fraction';
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
    .map(rawLine => {
      const source = String(rawLine || '').replace(/\s+$/g, '');
      const trimmed = source.trim();
      if (!trimmed) return '';

      const normalizedSection = normalizeRawSectionLabel(trimmed);
      if (normalizedSection !== trimmed) {
        return normalizedSection.trim();
      }

      if (looksLikeOrderMarkersLine(trimmed) || looksLikePureMathLine(trimmed)) {
        return source;
      }

      return trimmed;
    })
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

function getOperationDisplayedResult(operation) {
  const explicit = String(operation?.result || '').trim();
  if (explicit) return explicit;
  return computeOperationAnswerValue(operation);
}

function formatOperationStepLine(stepIndex, operation) {
  const expression = `${operation.a} ${operation.operator} ${operation.b}`;
  const result = getOperationDisplayedResult(operation);
  if (!result) {
    return `${stepIndex}) ${expression}.`;
  }
  return `${stepIndex}) ${expression} = ${result}.`;
}

function simplifyExistingStepLine(line, operation) {
  const text = String(line || '').trim();
  const stepMatch = text.match(/^(\d+)\)/);
  if (!text || !operation || !stepMatch || !lineMatchesOperation(text, operation)) {
    return ensureSentenceEnding(text);
  }
  return formatOperationStepLine(Number(stepMatch[1]), operation);
}

function ensureStepLineHasResult(line, operation) {
  const text = String(line || '').trim();
  if (!text || !operation || !lineMatchesOperation(text, operation)) {
    return ensureSentenceEnding(text);
  }
  return simplifyExistingStepLine(text, operation);
}

function extractCompoundExpressionBodyLines(explanationText) {
  const parsed = splitRawStructuredSections(explanationText);
  const kept = [];
  const seen = new Set();
  let skipColumnDetails = false;
  let waitingForOrderLine = false;

  const pushLine = line => {
    const prepared = ensureSentenceEnding(line);
    const key = prepared.trim().toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    kept.push(prepared);
  };

  parsed.bodyLines.forEach(rawLine => {
    const sourceLine = String(rawLine || '').replace(/\s+$/g, '');
    const trimmedLine = sourceLine.trim();
    const line = looksLikeOrderMarkersLine(trimmedLine) || looksLikePureMathLine(trimmedLine) ? sourceLine : trimmedLine;
    if (!trimmedLine || /^-{3,}$/.test(trimmedLine)) return;

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

function looksLikeTechnicalMaintenanceText(text) {
  return looksLikeTechnicalMaintenancePayload(text);
}

function sameOperation(left, right) {
  return Boolean(left && right)
    && left.a === right.a
    && left.b === right.b
    && left.operator === right.operator
    && left.index === right.index;
}

function hasReliableCompoundExpressionExplanation(parsed, operations) {
  if (!parsed || !operations.length) return false;

  const allText = [
    ...(parsed.bodyLines || []),
    parsed.answerLine,
    parsed.adviceLine,
    parsed.checkLine
  ].filter(Boolean).join(' ');

  if (looksLikeTechnicalMaintenanceText(allText)) {
    return false;
  }

  const stepLines = (parsed.bodyLines || []).filter(line => /^\d+\)/.test(String(line || '').trim()));
  if (stepLines.length < operations.length) {
    return false;
  }

  for (let index = 0; index < operations.length; index += 1) {
    if (!lineMatchesOperation(stepLines[index], operations[index])) {
      return false;
    }
  }

  return true;
}

function buildSyntheticCompoundExpressionStructure(taskText, operations, parsed = {}) {
  const orderPreparedLines = buildOrderGuidePreparedLines(taskText, operations);
  const prettyExpression = orderPreparedLines[2]
    || String(taskText || '')
      .replace(/[−–]/g, '-')
      .replace(/[xXхХ*]/g, '×')
      .replace(/[/:÷]/g, '÷')
      .replace(/\s+/g, ' ')
      .trim();
  const finalOperation = operations[operations.length - 1] || null;
  const answerValue = computeOperationAnswerValue(finalOperation) || 'проверь запись задачи';
  const bodyLines = [];
  const metaLines = [`Ответ: ${ensureSentenceEnding(answerValue)}`];

  if (prettyExpression) {
    bodyLines.push(`Пример: ${prettyExpression} = ${answerValue}.`);
  }
  if (orderPreparedLines.length) {
    bodyLines.push(...orderPreparedLines);
  }
  bodyLines.push('Решение по действиям:');
  operations.forEach((operation, index) => {
    bodyLines.push(formatSyntheticStepHeader(operation, index + 1));
  });

  if (parsed.adviceLine && !looksLikeTechnicalMaintenanceText(parsed.adviceLine)) {
    metaLines.push(parsed.adviceLine);
  }

  return {
    bodyLines,
    metaLines
  };
}

function buildDirectOperationExplanation(operation, explanationText) {
  const parsed = splitStructuredSections(explanationText);
  const parsedAnswer = parsed.answerLine ? extractSectionValue(parsed.answerLine, /^Ответ:\s*/i) : '';
  const answerValue = parsedAnswer || computeOperationAnswerValue(operation);
  const bodyLines = buildOperationLeadLines(operation);
  const metaLines = [];

  if (answerValue) {
    metaLines.push(`Ответ: ${ensureSentenceEnding(answerValue)}`);
  }
  if (parsed.adviceLine) {
    metaLines.push(parsed.adviceLine);
  }

  return {
    bodyLines,
    metaLines
  };
}

function normalizeFractionParsedSections(parsed, taskText) {
  const context = buildFractionVisualContext(taskText);
  const normalizedBodyLines = (parsed.bodyLines || []).map(line => {
    if (!/^Пример:/i.test(String(line || '').trim())) {
      return line;
    }
    if (context) {
      return `Пример: ${buildFractionTaskText(context)}`;
    }
    const ast = parseFractionExpressionAstFromTask(taskText);
    const pretty = ast ? renderFractionExpressionNode(ast) : '';
    return pretty ? `Пример: ${pretty}` : line;
  });

  const detailedAnswerText = buildDetailedFractionAnswerText(taskText);
  const fallbackAnswerText = context ? buildFractionAnswerText(context) : '';
  const answerText = detailedAnswerText || fallbackAnswerText;

  return {
    ...parsed,
    bodyLines: normalizedBodyLines,
    answerLine: answerText ? `Ответ: ${ensureSentenceEnding(answerText)}` : parsed.answerLine
  };
}

function buildSyntheticFractionStructure(taskText, parsed = {}) {
  const context = buildFractionVisualContext(taskText);
  if (!context) return null;

  const actionWord = context.operator === '+' ? 'Складываем' : 'Вычитаем';
  const actionWordLower = context.operator === '+' ? 'складываем' : 'вычитаем';
  const numeratorAction = context.operator === '+' ? '+' : '-';
  const bodyLines = [
    `Пример: ${buildFractionTaskText(context)}`,
    'Решение.'
  ];

  let stepNumber = 1;
  const extendOptionalResultSteps = rawFractionText => {
    const reducedText = formatReducedFractionText(context.reduced);
    if (reducedText && reducedText !== rawFractionText) {
      bodyLines.push(`${stepNumber}) Сокращаем дробь: ${rawFractionText} = ${reducedText}.`);
      stepNumber += 1;
    }
    if (context.mixed) {
      const mixedText = `${context.mixed.whole} ${context.mixed.numerator}/${context.mixed.denominator}`;
      const baseText = reducedText || rawFractionText;
      if (mixedText !== baseText) {
        bodyLines.push(`${stepNumber}) Выделяем целую часть: ${baseText} = ${mixedText}.`);
        stepNumber += 1;
      }
    }
  };

  if (context.b === context.d) {
    bodyLines.push(
      `${stepNumber}) Находим общий знаменатель. Знаменатели уже одинаковые: ${context.b} и ${context.d}.`
    );
    stepNumber += 1;
    bodyLines.push(
      `${stepNumber}) Дроби уже имеют одинаковый знаменатель. Значит, ${actionWordLower} только числители, а знаменатель оставляем прежним: ${context.a} ${numeratorAction} ${context.c} = ${context.rawNumerator}.`
    );
    stepNumber += 1;
    bodyLines.push(`${stepNumber}) Получаем: ${context.rawNumerator}/${context.common}.`);
    stepNumber += 1;
    extendOptionalResultSteps(`${context.rawNumerator}/${context.common}`);
  } else {
    bodyLines.push(
      `${stepNumber}) Находим общий знаменатель. Знаменатели: ${context.b} и ${context.d}. Общий знаменатель = ${context.common}, потому что ${context.common} делится на ${context.b} и на ${context.d}.`
    );
    stepNumber += 1;

    if (context.b === context.common) {
      bodyLines.push(`${stepNumber}) Первая дробь уже имеет знаменатель ${context.common}: ${context.a}/${context.b} = ${context.a}/${context.common}.`);
    } else {
      bodyLines.push(`${stepNumber}) Приводим первую дробь ${context.a}/${context.b} к знаменателю ${context.common}.`);
      bodyLines.push(`Спрашиваем: на сколько нужно умножить ${context.b}, чтобы получить ${context.common}?`);
      bodyLines.push(`${context.b} × ${context.aMultiplier} = ${context.common}`);
      bodyLines.push(`Нужно умножить на ${context.aMultiplier}.`);
      bodyLines.push(`Получаем: ${context.a}/${context.b} = (умножаем числитель и знаменатель на ${context.aMultiplier}) = ${context.aScaled}/${context.common}.`);
    }
    stepNumber += 1;

    if (context.d === context.common) {
      bodyLines.push(`${stepNumber}) Вторая дробь уже имеет знаменатель ${context.common}: ${context.c}/${context.d} = ${context.c}/${context.common}.`);
    } else {
      bodyLines.push(`${stepNumber}) Приводим вторую дробь ${context.c}/${context.d} к знаменателю ${context.common}.`);
      bodyLines.push(`Спрашиваем: на сколько нужно умножить ${context.d}, чтобы получить ${context.common}?`);
      bodyLines.push(`${context.d} × ${context.cMultiplier} = ${context.common}`);
      bodyLines.push(`Нужно умножить на ${context.cMultiplier}.`);
      bodyLines.push(`Получаем: ${context.c}/${context.d} = (умножаем числитель и знаменатель на ${context.cMultiplier}) = ${context.cScaled}/${context.common}.`);
    }
    stepNumber += 1;

    bodyLines.push(
      `${stepNumber}) ${actionWord} дроби с одинаковыми знаменателями. Знаменатель ${context.common} оставляем прежним, а числители ${actionWordLower}: ${context.aScaled} ${numeratorAction} ${context.cScaled} = ${context.rawNumerator}.`
    );
    bodyLines.push(`Получаем: ${context.rawNumerator}/${context.common}.`);
    stepNumber += 1;
    extendOptionalResultSteps(`${context.rawNumerator}/${context.common}`);
  }

  const metaLines = [];
  const answerText = buildFractionAnswerText(context);
  if (answerText) {
    metaLines.push(`Ответ: ${ensureSentenceEnding(answerText)}`);
  }
  if (parsed.adviceLine && !looksLikeTechnicalMaintenanceText(parsed.adviceLine)) {
    metaLines.push(parsed.adviceLine);
  }

  return {
    bodyLines,
    metaLines
  };
}

function prepareExplanationStructure(explanationText, operations, taskText) {
  const sanitizedExplanationText = looksLikeTechnicalMaintenanceText(explanationText) ? '' : explanationText;
  const kind = inferExplanationKind(taskText);
  const directTaskOperation = extractSingleDirectOperation(taskText);
  const primaryOperation = operations.length === 1 ? operations[0] : directTaskOperation;
  const directArithmeticTask = Boolean(directTaskOperation) && !isEquationTask(taskText);

  if (directArithmeticTask) {
    return buildDirectOperationExplanation(directTaskOperation, sanitizedExplanationText);
  }

  let parsed = kind === 'expression' && operations.length > 1
    ? extractCompoundExpressionBodyLines(sanitizedExplanationText)
    : splitStructuredSections(sanitizedExplanationText);

  if (kind === 'fraction') {
    parsed = normalizeFractionParsedSections(parsed, taskText);
    const syntheticFraction = buildSyntheticFractionStructure(taskText, parsed);
    if (syntheticFraction && (!parsed.bodyLines.length || !parsed.answerLine)) {
      return syntheticFraction;
    }
  }

  if (kind === 'expression' && operations.length > 1 && !hasReliableCompoundExpressionExplanation(parsed, operations)) {
    return buildSyntheticCompoundExpressionStructure(taskText, operations, parsed);
  }

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
    const computed = kind === 'expression' && operations.length > 1
      ? computeOperationAnswerValue(operations[operations.length - 1])
      : (primaryOperation ? computeOperationAnswerValue(primaryOperation) : '');
    metaLines.push(`Ответ: ${ensureSentenceEnding(computed || 'проверь запись задачи')}`);
  }

  return {
    bodyLines,
    metaLines
  };
}

function lineItem(text, lineIndex) {
  const source = String(text || '').replace(/\s+$/g, '');
  const trimmed = source.trim();
  const value = (looksLikeOrderMarkersLine(trimmed) || looksLikePureMathLine(trimmed)) ? source : trimmed;
  return { text: value, lineIndex };
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


function shouldRenderFractionsAsSchoolStack(line, kind) {
  if (kind !== 'fraction') return false;
  return /\d+\s*\/\s*\d+/.test(String(line || ''));
}

function countFractionTokens(text) {
  return (String(text || '').match(/\d+\s*\/\s*\d+/g) || []).length;
}

function looksLikeSchoolFractionChainLine(line, kind) {
  if (kind !== 'fraction') return false;
  const source = String(line || '').trim();
  const fractionCount = countFractionTokens(source);
  if (/^Пример:/i.test(source)) {
    return fractionCount >= 2;
  }
  if (fractionCount < 2 || !/=/.test(source)) return false;
  return /^(?:Ответ:|Записываем:|\d+\s*\/\s*\d+)/i.test(source);
}

function gcdInt(left, right) {
  let a = Math.abs(Number(left) || 0);
  let b = Math.abs(Number(right) || 0);
  while (b) {
    const next = a % b;
    a = b;
    b = next;
  }
  return a || 1;
}

function lcmInt(left, right) {
  const a = Math.abs(Number(left) || 0);
  const b = Math.abs(Number(right) || 0);
  if (!a || !b) return 0;
  return Math.abs((a / gcdInt(a, b)) * b);
}

function reduceFractionValue(numerator, denominator) {
  const rawNumerator = Number(numerator);
  const rawDenominator = Number(denominator);
  if (!Number.isFinite(rawNumerator) || !Number.isFinite(rawDenominator) || rawDenominator === 0) {
    return null;
  }
  const sign = rawDenominator < 0 ? -1 : 1;
  const normalizedNumerator = rawNumerator * sign;
  const normalizedDenominator = Math.abs(rawDenominator);
  const divisor = gcdInt(normalizedNumerator, normalizedDenominator);
  return {
    numerator: normalizedNumerator / divisor,
    denominator: normalizedDenominator / divisor
  };
}

function buildMixedFractionParts(numerator, denominator) {
  const value = reduceFractionValue(numerator, denominator);
  if (!value || value.denominator === 1 || Math.abs(value.numerator) < value.denominator) {
    return null;
  }
  const sign = value.numerator < 0 ? -1 : 1;
  const absoluteNumerator = Math.abs(value.numerator);
  const whole = Math.floor(absoluteNumerator / value.denominator) * sign;
  const remainder = absoluteNumerator % value.denominator;
  if (!remainder) return null;
  return {
    whole,
    numerator: remainder,
    denominator: value.denominator
  };
}

function buildFractionVisualContext(taskText) {
  const source = String(taskText || '').replace(/\s+/g, '');
  const match = source.match(/^(\d+)\/(\d+)([+\-])(\d+)\/(\d+)$/);
  if (!match) return null;

  const a = Number(match[1]);
  const b = Number(match[2]);
  const operator = match[3];
  const c = Number(match[4]);
  const d = Number(match[5]);
  if (![a, b, c, d].every(Number.isFinite) || b === 0 || d === 0) return null;

  const common = lcmInt(b, d);
  if (!common) return null;
  const aMultiplier = common / b;
  const cMultiplier = common / d;
  const aScaled = a * aMultiplier;
  const cScaled = c * cMultiplier;
  const rawNumerator = operator === '+' ? aScaled + cScaled : aScaled - cScaled;
  const reduced = reduceFractionValue(rawNumerator, common);
  const mixed = reduced ? buildMixedFractionParts(reduced.numerator, reduced.denominator) : null;

  return {
    a,
    b,
    c,
    d,
    operator,
    operatorSymbol: operator === '+' ? '+' : '-',
    common,
    aMultiplier,
    cMultiplier,
    aScaled,
    cScaled,
    rawNumerator,
    reduced,
    mixed
  };
}

function buildFractionTaskText(context) {
  if (!context) return '';
  return `${context.a}/${context.b} ${context.operatorSymbol} ${context.c}/${context.d}`;
}

function formatReducedFractionText(value) {
  if (!value) return '';
  if (value.denominator === 1) return String(value.numerator);
  return `${value.numerator}/${value.denominator}`;
}

function buildFractionAnswerText(context) {
  if (!context) return '';
  let chain = buildFractionTaskText(context);
  const scaledChanged = context.common !== context.b || context.common !== context.d;
  if (scaledChanged) {
    chain += ` = ${context.aScaled}/${context.common} ${context.operatorSymbol} ${context.cScaled}/${context.common}`;
  }
  chain += ` = ${context.rawNumerator}/${context.common}`;
  const reducedText = formatReducedFractionText(context.reduced);
  if (reducedText && reducedText !== `${context.rawNumerator}/${context.common}`) {
    chain += ` = ${reducedText}`;
  }
  if (context.mixed) {
    chain += ` = ${context.mixed.whole} ${context.mixed.numerator}/${context.mixed.denominator}`;
  }
  return chain;
}

function buildFractionExampleTokens(context) {
  if (!context) return [];
  return [
    { type: 'fraction', numerator: context.a, denominator: context.b },
    { type: 'operator', value: context.operatorSymbol },
    { type: 'fraction', numerator: context.c, denominator: context.d }
  ];
}

function renderInlineSchoolFraction(numerator, denominator, options = {}) {
  const mark = options?.mark;
  const classes = ['school-fraction', mark ? 'school-fraction--annotated' : ''].filter(Boolean).join(' ');
  return `
    <span class="${classes}" aria-label="${escapeHtml(`${numerator}/${denominator}`)}">
      ${mark ? `
        <span class="school-fraction__mark-wrap" aria-hidden="true">
          <span class="school-fraction__mark-connector"></span>
          <span class="school-fraction__mark">${escapeHtml(String(mark))}</span>
        </span>
      ` : ''}
      <span class="school-fraction__top">${escapeHtml(String(numerator))}</span>
      <span class="school-fraction__bar"></span>
      <span class="school-fraction__bottom">${escapeHtml(String(denominator))}</span>
    </span>
  `;
}

function buildFractionVisualTokens(context) {
  if (!context) return [];
  const tokens = [
    { type: 'fraction', numerator: context.a, denominator: context.b, mark: context.aMultiplier > 1 ? context.aMultiplier : '' },
    { type: 'operator', value: context.operatorSymbol },
    { type: 'fraction', numerator: context.c, denominator: context.d, mark: context.cMultiplier > 1 ? context.cMultiplier : '' }
  ];

  const scaledChanged = context.common !== context.b || context.common !== context.d;
  tokens.push({ type: 'equals', value: '=' });

  if (scaledChanged) {
    tokens.push(
      { type: 'fraction', numerator: context.aScaled, denominator: context.common },
      { type: 'operator', value: context.operatorSymbol },
      { type: 'fraction', numerator: context.cScaled, denominator: context.common },
      { type: 'equals', value: '=' }
    );
  }

  tokens.push({ type: 'fraction', numerator: context.rawNumerator, denominator: context.common });

  if (context.reduced && (context.reduced.numerator !== context.rawNumerator || context.reduced.denominator !== context.common)) {
    tokens.push({ type: 'equals', value: '=' });
    if (context.reduced.denominator === 1) {
      tokens.push({ type: 'number', value: context.reduced.numerator });
    } else {
      tokens.push({ type: 'fraction', numerator: context.reduced.numerator, denominator: context.reduced.denominator });
    }
  }

  if (context.mixed) {
    tokens.push({ type: 'equals', value: '=' });
    tokens.push({
      type: 'mixed',
      whole: context.mixed.whole,
      numerator: context.mixed.numerator,
      denominator: context.mixed.denominator
    });
  }

  return tokens;
}


function parseFractionTokenText(value) {
  const match = String(value || '').trim().match(/^(-?\d+)\s*\/\s*(\d+)$/);
  if (!match) return null;
  return {
    numerator: Number(match[1]),
    denominator: Number(match[2])
  };
}

function parseSimpleFractionBinarySegment(segment) {
  const match = String(segment || '').trim().match(/^(-?\d+)\s*\/\s*(\d+)\s*([+\-])\s*(-?\d+)\s*\/\s*(\d+)$/);
  if (!match) return null;
  return {
    left: {
      numerator: Number(match[1]),
      denominator: Number(match[2])
    },
    operator: match[3],
    right: {
      numerator: Number(match[4]),
      denominator: Number(match[5])
    }
  };
}

function tokenizeFractionVisualSegment(segment) {
  const source = String(segment || '');
  const pattern = /(\d+\s*\/\s*\d+)|([+\-×÷()])|(\d+)/g;
  const tokens = [];
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(source)) !== null) {
    const prefix = source.slice(lastIndex, match.index).trim();
    if (prefix) {
      tokens.push({ type: 'text', value: prefix });
    }
    if (match[1]) {
      const fraction = parseFractionTokenText(match[1]);
      if (fraction) {
        tokens.push({ type: 'fraction', numerator: fraction.numerator, denominator: fraction.denominator });
      }
    } else if (match[2]) {
      tokens.push({ type: 'operator', value: match[2] });
    } else if (match[3]) {
      tokens.push({ type: 'number', value: match[3] });
    }
    lastIndex = match.index + match[0].length;
  }

  const suffix = source.slice(lastIndex).trim();
  if (suffix) {
    tokens.push({ type: 'text', value: suffix });
  }

  return tokens;
}

function buildLineSpecificFractionVisualTokens(bodyText) {
  const segments = String(bodyText || '')
    .split(/\s*=\s*/)
    .map(segment => segment.trim())
    .filter(Boolean);

  if (segments.length < 2) return null;

  let annotationIndex = -1;
  let annotationMarks = null;

  for (let index = 0; index < segments.length - 1; index += 1) {
    const current = parseSimpleFractionBinarySegment(segments[index]);
    const next = parseSimpleFractionBinarySegment(segments[index + 1]);
    if (!current || !next || current.operator !== next.operator) continue;
    if (next.left.denominator !== next.right.denominator) continue;

    const common = next.left.denominator;
    const leftMultiplier = common / current.left.denominator;
    const rightMultiplier = common / current.right.denominator;
    if (!Number.isInteger(leftMultiplier) || !Number.isInteger(rightMultiplier)) continue;
    if (current.left.numerator * leftMultiplier !== next.left.numerator) continue;
    if (current.right.numerator * rightMultiplier !== next.right.numerator) continue;

    annotationIndex = index;
    annotationMarks = {
      left: leftMultiplier > 1 ? leftMultiplier : '',
      right: rightMultiplier > 1 ? rightMultiplier : ''
    };
    break;
  }

  if (annotationIndex < 0) return null;

  const tokens = [];
  segments.forEach((segment, index) => {
    if (index > 0) {
      tokens.push({ type: 'equals', value: '=' });
    }

    if (index === annotationIndex) {
      const parsed = parseSimpleFractionBinarySegment(segment);
      if (parsed) {
        tokens.push({ type: 'fraction', numerator: parsed.left.numerator, denominator: parsed.left.denominator, mark: annotationMarks.left });
        tokens.push({ type: 'operator', value: parsed.operator });
        tokens.push({ type: 'fraction', numerator: parsed.right.numerator, denominator: parsed.right.denominator, mark: annotationMarks.right });
        return;
      }
    }

    tokens.push(...tokenizeFractionVisualSegment(segment));
  });

  return tokens.length ? tokens : null;
}

function renderFractionVisualToken(token) {
  if (!token) return '';
  if (token.type === 'fraction') {
    return `<span class="school-fraction-expression__fraction">${renderInlineSchoolFraction(token.numerator, token.denominator, { mark: token.mark })}</span>`;
  }
  if (token.type === 'mixed') {
    return `<span class="school-fraction-expression__mixed"><span class="school-fraction-expression__number">${escapeHtml(String(token.whole))}</span>${renderInlineSchoolFraction(token.numerator, token.denominator)}</span>`;
  }
  if (token.type === 'number') {
    return `<span class="school-fraction-expression__number">${escapeHtml(String(token.value))}</span>`;
  }
  if (token.type === 'operator' || token.type === 'equals') {
    return `<span class="school-fraction-expression__op">${escapeHtml(String(token.value))}</span>`;
  }
  return `<span class="school-fraction-expression__text">${escapeHtml(String(token.value || ''))}</span>`;
}

function renderFractionEquationBody(bodyText) {
  const source = String(bodyText || '');
  const pattern = /(\d+)\s*\/\s*(\d+)|([=+\-×÷()])|(\d+)/g;
  let html = '';
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(source)) !== null) {
    const prefix = source.slice(lastIndex, match.index);
    if (prefix.trim()) {
      html += `<span class="school-fraction-expression__text">${escapeHtml(prefix.trim())}</span>`;
    }
    if (match[1] && match[2]) {
      html += renderFractionVisualToken({ type: 'fraction', numerator: match[1], denominator: match[2] });
    } else if (match[3]) {
      html += renderFractionVisualToken({ type: match[3] === '=' ? 'equals' : 'operator', value: match[3] });
    } else if (match[4]) {
      html += renderFractionVisualToken({ type: 'number', value: match[4] });
    }
    lastIndex = match.index + match[0].length;
  }

  const suffix = source.slice(lastIndex).trim();
  if (suffix) {
    html += `<span class="school-fraction-expression__text">${escapeHtml(suffix)}</span>`;
  }
  return html;
}

function renderSchoolFractionEquationLine(text, context = {}) {
  const source = String(text || '').trim();
  const match = source.match(/^([^:]+:)\s*(.*)$/);
  const prefix = match ? match[1] : '';
  const bodyText = match ? match[2] : source;
  const fractionVisual = context?.fractionVisual || null;
  const isExampleLine = /^Пример:/i.test(prefix);
  const isAnswerLine = /^(?:Ответ:|Записываем:)/i.test(prefix);

  let visualTokens = null;
  if (fractionVisual && isExampleLine) {
    visualTokens = buildFractionExampleTokens(fractionVisual);
  } else if (fractionVisual && isAnswerLine) {
    visualTokens = buildFractionVisualTokens(fractionVisual);
  }
  if (!visualTokens && isAnswerLine) {
    visualTokens = buildLineSpecificFractionVisualTokens(bodyText);
  }

  const bodyHtml = visualTokens
    ? visualTokens.map(renderFractionVisualToken).join('')
    : renderFractionEquationBody(bodyText);
  return `
    <span class="school-fraction-expression${visualTokens ? ' school-fraction-expression--visual' : ''}">
      ${prefix ? `<span class="school-fraction-expression__prefix">${escapeHtml(prefix)}</span>` : ''}
      <span class="school-fraction-expression__body">${bodyHtml}</span>
    </span>
  `;
}

function renderTextWithSchoolFractions(text, kind) {
  const source = String(text || '');
  if (!shouldRenderFractionsAsSchoolStack(source, kind)) {
    return escapeHtml(source);
  }

  const pattern = /(\d+)\s*\/\s*(\d+)/g;
  let html = '';
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(source)) !== null) {
    html += escapeHtml(source.slice(lastIndex, match.index));
    html += renderInlineSchoolFraction(match[1], match[2]);
    lastIndex = match.index + match[0].length;
  }

  html += escapeHtml(source.slice(lastIndex));
  return html;
}

function renderRichFractionContent(text, context = {}) {
  const kind = context?.kind || '';
  if (looksLikeSchoolFractionChainLine(text, kind)) {
    return renderSchoolFractionEquationLine(text, context);
  }
  return renderTextWithSchoolFractions(text, kind);
}

function renderExplanationLine(item, context = {}) {
  const line = item?.text || '';
  const kind = context?.kind || '';
  const safe = escapeHtml(line);
  const rich = renderRichFractionContent(line, context);
  const attrs = typeof item?.lineIndex === 'number' ? ` data-result-line-index="${item.lineIndex}"` : '';
  if (/^Ответ:/i.test(line)) {
    return `<div class="result-line result-line--answer${shouldRenderFractionsAsSchoolStack(line, kind) ? ' result-line--fraction' : ''}"${attrs}>${rich}</div>`;
  }
  if (/^Совет:/i.test(line)) {
    return `<div class="result-line result-line--advice${shouldRenderFractionsAsSchoolStack(line, kind) ? ' result-line--fraction' : ''}"${attrs}>${rich}</div>`;
  }
  if (/^Проверка:/i.test(line)) {
    return `<p class="result-line result-line--check${shouldRenderFractionsAsSchoolStack(line, kind) ? ' result-line--fraction' : ''}"${attrs}>${rich}</p>`;
  }
  if (/^(\d+)\)/.test(line.trim())) {
    const stepNumber = Number((line.trim().match(/^(\d+)\)/) || [])[1]);
    const prefix = `${stepNumber})`;
    const content = line.trim().slice(prefix.length).trimStart();
    const color = Number.isFinite(stepNumber) ? getStepColor(stepNumber - 1) : '';
    return `<p class="result-line result-line--step${shouldRenderFractionsAsSchoolStack(content, kind) ? ' result-line--fraction' : ''}"${attrs}><span class="result-line-step__index" style="color:${color};">${escapeHtml(prefix)}</span> <span class="result-line-step__text">${renderRichFractionContent(content, context)}</span></p>`;
  }
  if (looksLikeOrderMarkersLine(line)) {
    return renderOrderMarkersLine(item);
  }
  if (/^(Порядок действий:?|Решение(?: по действиям)?[.:]?|Решение\.)$/i.test(line)) {
    return `<p class="result-line result-line--section"${attrs}>${safe}</p>`;
  }
  if (shouldRenderFractionsAsSchoolStack(line, kind)) {
    const extraClass = looksLikePureMathLine(line) ? ' result-line--fraction-math' : ' result-line--fraction';
    return `<p class="result-line${extraClass}"${attrs}>${rich}</p>`;
  }
  if (looksLikePureMathLine(line)) {
    return `<p class="result-line result-line--math"${attrs}>${safe}</p>`;
  }
  return `<p class="result-line"${attrs}>${safe}</p>`;
}

function renderExplanationItems(items, context = {}) {
  if (!items.length) {
    return '<p class="result-line">Здесь появится объяснение и ответ.</p>';
  }

  return items.map(item => renderExplanationLine(item, context)).join('');
}


function formatSyntheticStepHeader(operation, stepIndex) {
  return formatOperationStepLine(stepIndex, operation);
}

function buildFlowItems(bodyLineItems, blocks, options = {}) {
  const { showSyntheticStepHeaders = false, orderGuideBlock = null, operations = [] } = options;
  const flowItems = [];
  const usedBlockIndexes = new Set();
  let orderInserted = false;

  const findOperationStepIndex = operation => {
    const foundIndex = operations.findIndex(item => sameOperation(item, operation));
    return foundIndex >= 0 ? foundIndex + 1 : null;
  };

  for (let lineCursor = 0; lineCursor < bodyLineItems.length; lineCursor += 1) {
    const item = bodyLineItems[lineCursor];
    let nextItem = item;

    if (orderGuideBlock && /^Порядок действий:?$/i.test(item.text.trim())) {
      flowItems.push({
        type: 'order-block',
        block: {
          ...orderGuideBlock,
          titleLineIndex: item.lineIndex
        }
      });
      orderInserted = true;
      while (
        lineCursor + 1 < bodyLineItems.length
        && (
          looksLikeOrderMarkersLine(bodyLineItems[lineCursor + 1].text)
          || (looksLikePureMathLine(bodyLineItems[lineCursor + 1].text) && !/=/.test(bodyLineItems[lineCursor + 1].text))
        )
      ) {
        lineCursor += 1;
      }
      continue;
    }

    if (
      orderGuideBlock
      && !orderInserted
      && (
        looksLikeOrderMarkersLine(item.text)
        || (looksLikePureMathLine(item.text) && !/=/.test(item.text))
      )
    ) {
      continue;
    }

    if (/^\d+\)/.test(item.text.trim())) {
      const matchedOperation = operations.find(operation => lineMatchesOperation(item.text, operation));
      if (matchedOperation) {
        nextItem = { ...item, text: simplifyExistingStepLine(item.text, matchedOperation) };
      }
      const blockIndex = blocks.findIndex((block, index) => !usedBlockIndexes.has(index) && lineMatchesOperation(nextItem.text, block.operation));
      if (blockIndex >= 0) {
        const block = blocks[blockIndex];
        nextItem = { ...nextItem, text: ensureStepLineHasResult(nextItem.text, block.operation) };
        usedBlockIndexes.add(blockIndex);
        flowItems.push({ type: 'line', item: nextItem });
        flowItems.push({ type: 'block', block });
        continue;
      }
    }
    flowItems.push({ type: 'line', item: nextItem });
  }

  if (orderGuideBlock && !orderInserted) {
    const insertAt = flowItems.findIndex(item => item.type === 'line' && /^Решение(?: по действиям)?[.:]?$/i.test(item.item.text));
    const orderItem = { type: 'order-block', block: orderGuideBlock };
    if (insertAt >= 0) {
      flowItems.splice(insertAt, 0, orderItem);
    } else {
      flowItems.unshift(orderItem);
    }
  }

  blocks.forEach((block, index) => {
    if (usedBlockIndexes.has(index)) {
      return;
    }
    if (showSyntheticStepHeaders) {
      const stepIndex = findOperationStepIndex(block.operation) || (index + 1);
      flowItems.push({
        type: 'line',
        item: { text: formatSyntheticStepHeader(block.operation, stepIndex) }
      });
    }
    flowItems.push({ type: 'block', block });
  });

  return flowItems;
}

function buildPreparedExplanationData({ explanationText, taskText }) {
  const kind = inferExplanationKind(taskText);
  const operations = collectOperations(taskText, explanationText);
  const models = operations.filter(shouldUseColumn).map(operation => ({ operation, model: buildColumnModel(operation) }));
  const structure = prepareExplanationStructure(String(explanationText || ''), operations, taskText);

  let nextLineIndex = 0;
  const bodyLineItems = structure.bodyLines.map(text => lineItem(text, nextLineIndex++));
  const orderGuideRefs = {
    titleLineIndex: bodyLineItems.find(item => /^Порядок действий:?$/i.test(item.text.trim()))?.lineIndex,
    markerLineIndex: bodyLineItems.find(item => looksLikeOrderMarkersLine(item.text))?.lineIndex,
    expressionLineIndex: bodyLineItems.find(item => looksLikePureMathLine(item.text) && !/=/.test(item.text))?.lineIndex
  };
  const orderGuideBlock = buildOrderGuideBlock(taskText, operations, orderGuideRefs);
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
  const flowItems = buildFlowItems(bodyLineItems, blocks, {
    showSyntheticStepHeaders: kind === 'expression' && operations.length > 1,
    orderGuideBlock,
    operations
  });

  const preparedFlowLines = flowItems.flatMap(item => {
    if (item.type === 'line') return [item.item.text];
    if (item.type === 'order-block') return item.block.preparedLines?.length ? item.block.preparedLines : [item.block.title];
    return [item.block.title, ...item.block.noteItems.map(note => note.text)];
  });

  const speechLines = [
    ...flowItems.flatMap(item => {
      if (item.type === 'line') return [item.item.text];
      if (item.type === 'order-block') return item.block.speechLines?.length ? item.block.speechLines : [item.block.title];
      return [item.block.title, ...item.block.noteItems.map(note => note.text)];
    }),
    ...metaLineItems.map(item => item.text)
  ].filter(Boolean);

  const preparedExplanation = [
    ...preparedFlowLines,
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
  const kind = inferExplanationKind(taskText);
  const renderContext = { kind, taskText, fractionVisual: buildFractionVisualContext(taskText) };
  const flowHtml = data.flowItems.length
    ? data.flowItems.map(item => {
      if (item.type === 'line') return renderExplanationLine(item.item, renderContext);
      if (item.type === 'order-block') return renderOrderGuideBlock(item.block);
      return renderColumnBlock(item.block);
    }).join('')
    : '<p class="result-line">Здесь появится объяснение и ответ.</p>';

  const tailHtml = data.metaLineItems.length
    ? `
      <div class="result-text-flow result-text-flow--tail">
        ${renderExplanationItems(data.metaLineItems, renderContext)}
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
