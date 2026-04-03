function normalizeOperator(operator) {
  if (operator === '×' || operator === 'x' || operator === 'х' || operator === '*') return '*';
  if (operator === '÷' || operator === ':') return '/';
  return operator;
}

function formatNumber(value) {
  return Number(value).toString();
}

function digitsCount(value) {
  return formatNumber(Math.abs(Number(value))).replace(/\D/g, '').length;
}

function toCells(value) {
  return formatNumber(value).split('');
}

function createKey(left, operator, right, result) {
  return [left, operator, right, result].join('|');
}

function computeResult(left, operator, right) {
  switch (operator) {
    case '+': return left + right;
    case '-': return left - right;
    case '*': return left * right;
    case '/': return right !== 0 ? left / right : null;
    default: return null;
  }
}

function isSafeIntegerOperation(left, right, result) {
  return Number.isInteger(left) && Number.isInteger(right) && Number.isFinite(result) && Number.isInteger(result);
}

function normalizeExpression(leftRaw, operatorRaw, rightRaw, resultRaw) {
  const operator = normalizeOperator(operatorRaw);
  const left = Number(String(leftRaw).replace(',', '.'));
  const right = Number(String(rightRaw).replace(',', '.'));
  const computed = computeResult(left, operator, right);
  const result = resultRaw != null && resultRaw !== ''
    ? Number(String(resultRaw).replace(',', '.'))
    : computed;

  if (!Number.isFinite(left) || !Number.isFinite(right) || !Number.isFinite(result)) return null;
  if (!isSafeIntegerOperation(left, right, result)) return null;
  if (operator === '/' && right === 0) return null;

  const computedResult = computeResult(left, operator, right);
  if (!Number.isFinite(computedResult)) return null;
  if (Math.abs(computedResult - result) > 0.000001) return null;

  const multiDigit = digitsCount(left) >= 2 || digitsCount(right) >= 2;

  return {
    id: createKey(left, operator, right, result),
    left,
    right,
    result,
    operator,
    inlineText: `${formatNumber(left)} ${operator === '/' ? ':' : operator} ${formatNumber(right)} = ${formatNumber(result)}`,
    showInline: true,
    showColumn: multiDigit,
    columnType: operator,
    maxDigits: Math.max(digitsCount(left), digitsCount(right), digitsCount(result))
  };
}

function extractExpressions(text) {
  if (!text) return [];

  const patterns = [
    /(^|[^\d/])(\d+)\s*([+\-*×xх:÷])\s*(\d+)(?:\s*=\s*(-?\d+))?/gmu,
    /(^|[^\d])(\d+)\s+(\/)\s+(\d+)(?:\s*=\s*(-?\d+))?/gmu
  ];

  const found = [];

  patterns.forEach(pattern => {
    for (const match of text.matchAll(pattern)) {
      const [, , left, operator, right, result] = match;
      const normalized = normalizeExpression(left, operator, right, result);
      if (normalized) found.push(normalized);
    }
  });

  return found;
}

function uniqueOperations(items) {
  const seen = new Set();
  return items.filter(item => {
    if (!item) return false;
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

export function buildMathPresentation(taskText, explanationText) {
  const operations = uniqueOperations([
    ...extractExpressions(explanationText),
    ...extractExpressions(taskText)
  ]);

  return {
    text: explanationText || '',
    operations,
    hasVisuals: operations.some(item => item.showInline || item.showColumn)
  };
}

export function createEmptyMathPresentation(text = '') {
  return {
    text,
    operations: [],
    hasVisuals: false
  };
}

export function normalizeStoredPresentation(value) {
  if (!value || typeof value !== 'object') return createEmptyMathPresentation('');
  if (!Array.isArray(value.operations)) return createEmptyMathPresentation(value.text || '');
  return {
    text: typeof value.text === 'string' ? value.text : '',
    operations: uniqueOperations(value.operations.map(item => {
      if (!item || typeof item !== 'object') return null;
      return normalizeExpression(item.left, item.operator, item.right, item.result);
    })),
    hasVisuals: Array.isArray(value.operations) && value.operations.length > 0
  };
}

export function summarizePresentationText(presentation) {
  return presentation?.text || '';
}

export function getPresentationPreview(presentation, limit = 180) {
  const text = summarizePresentationText(presentation);
  if (!text) return '';
  return text.length > limit ? `${text.slice(0, limit)}…` : text;
}

export function getColumnCells(value) {
  return toCells(value);
}
