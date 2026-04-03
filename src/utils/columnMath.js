import { escapeHtml } from './text.js';

function normalizeNumber(raw) {
  return String(raw || '').replace(/\s+/g, '').replace(/,/g, '.');
}

function normalizeOperator(raw) {
  if (!raw) return '';
  if (/[×xх*]/i.test(raw)) return '*';
  if (/[÷:]/.test(raw)) return '/';
  if (/[−-]/.test(raw)) return '-';
  if (/\+/.test(raw)) return '+';
  return raw;
}

export function extractArithmeticExpression(text) {
  const source = String(text || '').replace(/\u00A0/g, ' ');
  const match = source.match(/(\d[\d\s]*)\s*([+\-−×xх*:÷\/])\s*(\d[\d\s]*)/i);
  if (!match) return null;

  const leftRaw = normalizeNumber(match[1]);
  const rightRaw = normalizeNumber(match[3]);
  const operator = normalizeOperator(match[2]);

  if (!/^\d+$/.test(leftRaw) || !/^\d+$/.test(rightRaw)) return null;

  return {
    left: Number(leftRaw),
    right: Number(rightRaw),
    leftText: leftRaw,
    rightText: rightRaw,
    operator,
    expression: `${leftRaw} ${operator} ${rightRaw}`
  };
}

function hasMultiDigitOperand(expression) {
  return expression && (expression.leftText.length >= 2 || expression.rightText.length >= 2);
}

function padLeft(value, size) {
  return String(value).padStart(size, ' ');
}

function cell(content = '', classes = '') {
  return `<span class="cm-cell ${classes}">${content ? escapeHtml(String(content)) : '&nbsp;'}</span>`;
}

function makeGrid(rows, extraClass = '') {
  const cols = Math.max(...rows.map(row => row.length), 1);
  const html = rows
    .map(row => row.map(item => cell(item.value, item.classes || '')).join(''))
    .join('');

  return `<div class="cm-grid ${extraClass}" style="--cm-cols:${cols}">${html}</div>`;
}

function digitsRow(text, width, prefix = '', prefixClass = '') {
  const chars = String(text).split('');
  const padded = Array.from({ length: width - chars.length }, () => ({ value: '' }))
    .concat(chars.map(ch => ({ value: ch })));

  if (!prefix) return padded;
  return [{ value: prefix, classes: prefixClass }].concat(padded);
}

function addSubRows(leftText, rightText, operator, resultText) {
  const width = Math.max(leftText.length, rightText.length, resultText.length);
  return [
    digitsRow(leftText, width),
    digitsRow(rightText, width, operator, 'cm-sign'),
    Array.from({ length: width + 1 }, (_, i) => ({ value: '', classes: i === 0 ? 'cm-line-empty' : 'cm-line' })),
    digitsRow(resultText, width)
  ];
}

function multiplyRows(leftText, rightText, resultText) {
  const partials = [];
  const rightDigits = rightText.split('').reverse();

  rightDigits.forEach((digit, index) => {
    const partValue = Number(leftText) * Number(digit);
    const partText = partValue === 0 ? '0' : `${partValue}${'0'.repeat(index)}`;
    partials.push(partText);
  });

  const width = Math.max(leftText.length, rightText.length, resultText.length, ...partials.map(x => x.length));
  const rows = [
    digitsRow(leftText, width),
    digitsRow(rightText, width, '×', 'cm-sign'),
    Array.from({ length: width + 1 }, (_, i) => ({ value: '', classes: i === 0 ? 'cm-line-empty' : 'cm-line' }))
  ];

  partials.forEach(part => rows.push(digitsRow(part, width)));

  if (partials.length > 1) {
    rows.push(Array.from({ length: width + 1 }, (_, i) => ({ value: '', classes: i === 0 ? 'cm-line-empty' : 'cm-line' })));
  }

  rows.push(digitsRow(resultText, width));
  return rows;
}

function buildLongDivisionData(dividend, divisor) {
  const digits = String(dividend).split('').map(Number);
  const quotientDigits = [];
  const steps = [];
  let current = 0;

  digits.forEach((digit) => {
    current = current * 10 + digit;

    if (quotientDigits.length === 0 && current < divisor) {
      quotientDigits.push('0');
      return;
    }

    const q = Math.floor(current / divisor);
    quotientDigits.push(String(q));

    if (q > 0) {
      const product = q * divisor;
      const remainder = current - product;
      steps.push({ current, product, remainder });
      current = remainder;
    }
  });

  const quotient = quotientDigits.join('').replace(/^0+(?=\d)/, '') || '0';
  return {
    quotient,
    remainder: current,
    steps
  };
}

function makeDivisionHtml(dividend, divisor) {
  const { quotient, remainder, steps } = buildLongDivisionData(dividend, divisor);
  const stepCards = steps.length
    ? steps.map((step, index) => `
      <div class="longdiv-step">
        <div class="longdiv-step-title">Шаг ${index + 1}</div>
        <div class="longdiv-step-text">Берём ${step.current}. Делим на ${divisor}. Получаем ${Math.floor(step.current / divisor)}.</div>
        <div class="longdiv-step-text">Пишем ${step.product} под ${step.current} и вычитаем. Остаток ${step.remainder}.</div>
      </div>
    `).join('')
    : '<div class="longdiv-step"><div class="longdiv-step-text">Делимое меньше делителя. Частное 0.</div></div>';

  return `
    <div class="longdiv-layout">
      <div class="longdiv-bracket">
        <div class="longdiv-dividend">${escapeHtml(String(dividend))}</div>
        <div class="longdiv-divisor">${escapeHtml(String(divisor))}</div>
        <div class="longdiv-quotient">${escapeHtml(String(quotient))}${remainder ? `, остаток ${escapeHtml(String(remainder))}` : ''}</div>
      </div>
      <div class="longdiv-steps">${stepCards}</div>
    </div>
  `;
}

function buildInlineText(expression) {
  const { left, right, operator } = expression;

  if (operator === '+') return `${left} + ${right} = ${left + right}`;
  if (operator === '-') return `${left} - ${right} = ${left - right}`;
  if (operator === '*') return `${left} × ${right} = ${left * right}`;
  if (operator === '/') {
    const quotient = Math.floor(left / right);
    const remainder = left % right;
    return remainder === 0
      ? `${left} : ${right} = ${quotient}`
      : `${left} : ${right} = ${quotient}, остаток ${remainder}`;
  }

  return expression.expression;
}

export function buildColumnSolution(taskText) {
  const expression = extractArithmeticExpression(taskText);
  if (!expression || !hasMultiDigitOperand(expression) || expression.right === 0) return null;

  const inlineText = buildInlineText(expression);

  if (expression.operator === '+') {
    const rows = addSubRows(expression.leftText, expression.rightText, '+', String(expression.left + expression.right));
    return {
      title: 'Решение в столбик',
      inlineTitle: 'Решение в строку',
      inlineText,
      html: makeGrid(rows, 'cm-grid-addsub')
    };
  }

  if (expression.operator === '-') {
    const rows = addSubRows(expression.leftText, expression.rightText, '−', String(expression.left - expression.right));
    return {
      title: 'Решение в столбик',
      inlineTitle: 'Решение в строку',
      inlineText,
      html: makeGrid(rows, 'cm-grid-addsub')
    };
  }

  if (expression.operator === '*') {
    const rows = multiplyRows(expression.leftText, expression.rightText, String(expression.left * expression.right));
    return {
      title: 'Решение в столбик',
      inlineTitle: 'Решение в строку',
      inlineText,
      html: makeGrid(rows, 'cm-grid-multiply')
    };
  }

  if (expression.operator === '/') {
    return {
      title: 'Решение в столбик',
      inlineTitle: 'Решение в строку',
      inlineText,
      html: makeDivisionHtml(expression.left, expression.right)
    };
  }

  return null;
}
