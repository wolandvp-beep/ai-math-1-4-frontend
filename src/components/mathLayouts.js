import { escapeHtml } from '../utils/text.js';
import { getColumnCells } from '../utils/mathPresentation.js';

function padStartCells(cells, size) {
  const normalized = Array.isArray(cells) ? cells : [];
  return Array(Math.max(size - normalized.length, 0)).fill('').concat(normalized);
}

function renderGridRow(cells, className = '') {
  return cells
    .map(cell => `<span class="math-cell ${className}${cell === '' ? ' is-empty' : ''}">${cell === '' ? '&nbsp;' : escapeHtml(String(cell))}</span>`)
    .join('');
}

function renderInlineLine(operation) {
  return `
    <div class="math-inline-line">
      <span class="math-inline-label">В строку</span>
      <span class="math-inline-expression">${escapeHtml(operation.inlineText)}</span>
    </div>
  `;
}

function buildAdditionOrSubtractionRows(operation) {
  const operatorCell = operation.operator;
  const width = Math.max(
    getColumnCells(operation.left).length,
    getColumnCells(operation.right).length,
    getColumnCells(operation.result).length
  );

  const leftRow = [''].concat(padStartCells(getColumnCells(operation.left), width));
  const rightRow = [operatorCell].concat(padStartCells(getColumnCells(operation.right), width));
  const resultRow = [''].concat(padStartCells(getColumnCells(operation.result), width));

  return {
    width: width + 1,
    rows: [
      renderGridRow(leftRow),
      renderGridRow(rightRow, 'math-cell-line-top'),
      renderGridRow(resultRow)
    ]
  };
}

function buildMultiplicationRows(operation) {
  const leftDigits = getColumnCells(operation.left);
  const rightDigits = getColumnCells(operation.right);
  const resultDigits = getColumnCells(operation.result);
  const partials = [];
  const reversed = [...rightDigits].reverse();

  reversed.forEach((digitChar, index) => {
    const digit = Number(digitChar);
    const partial = operation.left * digit;
    const partialCells = getColumnCells(partial).concat(Array(index).fill(''));
    partials.push(partialCells);
  });

  const width = Math.max(
    leftDigits.length,
    rightDigits.length,
    resultDigits.length,
    ...partials.map(item => item.length)
  );

  const rows = [
    renderGridRow([''].concat(padStartCells(leftDigits, width))),
    renderGridRow(['×'].concat(padStartCells(rightDigits, width)), 'math-cell-line-top')
  ];

  partials.forEach((cells, index) => {
    const cls = index === partials.length - 1 && partials.length === 1 ? '' : '';
    rows.push(renderGridRow([''].concat(padStartCells(cells, width)), cls));
  });

  if (partials.length > 1) {
    rows.push(renderGridRow([''].concat(Array(width).fill('')), 'math-cell-line-top'));
  }

  rows.push(renderGridRow([''].concat(padStartCells(resultDigits, width))));

  return { width: width + 1, rows };
}

function buildDivisionSteps(operation) {
  const dividendDigits = getColumnCells(operation.left);
  const quotientDigits = getColumnCells(operation.result);
  const steps = [];
  let current = 0;
  let started = false;

  dividendDigits.forEach((digitChar, index) => {
    current = current * 10 + Number(digitChar);
    if (current < operation.right && !started) return;

    started = true;
    const quotientDigit = Math.floor(current / operation.right);
    const product = quotientDigit * operation.right;
    const remainder = current - product;
    steps.push({
      index,
      current,
      product,
      remainder,
      quotientDigit
    });
    current = remainder;
  });

  return {
    quotientDigits,
    dividendDigits,
    divisorDigits: getColumnCells(operation.right),
    steps,
    remainder: current
  };
}

function renderDivisionColumn(operation) {
  const model = buildDivisionSteps(operation);
  const totalColumns = Math.max(model.dividendDigits.length, model.quotientDigits.length) + 2;

  const quotientCells = Array(totalColumns).fill('');
  model.quotientDigits.forEach((digit, index) => {
    quotientCells[index + 1] = digit;
  });

  const dividendCells = Array(totalColumns).fill('');
  model.dividendDigits.forEach((digit, index) => {
    dividendCells[index + 1] = digit;
  });

  const stepRows = model.steps.map(step => {
    const row = Array(totalColumns).fill('');
    const productCells = getColumnCells(step.product);
    const remainderCells = getColumnCells(step.remainder);
    const productStart = Math.max(step.index + 2 - productCells.length, 1);
    const remainderStart = Math.max(step.index + 2 - remainderCells.length, 1);

    productCells.forEach((digit, idx) => {
      row[productStart + idx] = digit;
    });

    const remainderRow = Array(totalColumns).fill('');
    remainderCells.forEach((digit, idx) => {
      remainderRow[remainderStart + idx] = digit;
    });

    return `
      <div class="math-long-division-step" style="--division-columns:${totalColumns};">
        ${renderGridRow(row, 'math-cell-line-top')}
        ${renderGridRow(remainderRow)}
      </div>
    `;
  }).join('');

  return `
    <div class="math-long-division">
      <div class="math-long-division-top">
        <div class="math-long-division-divisor">${escapeHtml(String(operation.right))}</div>
        <div class="math-long-division-body">
          <div class="math-long-division-quotient" style="--division-columns:${totalColumns};">
            ${renderGridRow(quotientCells)}
          </div>
          <div class="math-long-division-dividend" style="--division-columns:${totalColumns};">
            ${renderGridRow(dividendCells, 'math-cell-line-top')}
          </div>
        </div>
      </div>
      <div class="math-long-division-steps">${stepRows}</div>
    </div>
  `;
}

function renderColumn(operation) {
  if (!operation.showColumn) return '';

  if (operation.columnType === '/' && Number.isInteger(operation.left) && Number.isInteger(operation.right) && Number.isInteger(operation.result) && operation.right !== 0) {
    return `
      <div class="math-visual-block">
        <div class="math-visual-title">В столбик</div>
        ${renderDivisionColumn(operation)}
      </div>
    `;
  }

  const model = operation.columnType === '*'
    ? buildMultiplicationRows(operation)
    : buildAdditionOrSubtractionRows(operation);

  return `
    <div class="math-visual-block">
      <div class="math-visual-title">В столбик</div>
      <div class="math-column-grid" style="--math-columns:${model.width};">
        ${model.rows.map(row => `<div class="math-column-row">${row}</div>`).join('')}
      </div>
    </div>
  `;
}

function renderOperationCard(operation) {
  return `
    <div class="math-card" data-math-operation="${escapeHtml(operation.id)}">
      <div class="math-card-head">
        <div class="math-card-title">${escapeHtml(operation.inlineText)}</div>
      </div>
      ${renderInlineLine(operation)}
      ${renderColumn(operation)}
    </div>
  `;
}

export function renderMathPresentation(presentation) {
  if (!presentation?.operations?.length) return '';

  return `
    <section class="math-presentation">
      <div class="math-presentation-head">Показ решения</div>
      <div class="math-presentation-list">
        ${presentation.operations.map(renderOperationCard).join('')}
      </div>
    </section>
  `;
}
