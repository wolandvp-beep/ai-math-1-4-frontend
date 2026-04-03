function escapeHtml(str) {
  return String(str || '').replace(/[&<>"]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));
}

function hasLongDivisionCandidate(text) {
  const source = String(text || '').toLowerCase();
  if (!source.trim()) return false;

  const hasDivisionWord = /(дел(ить|ение)|раздел(ить|и)|частное|:|\/|÷)/i.test(source);
  const hasMultiDigitNumber = /(^|\D)\d{2,}(\D|$)/.test(source);

  return hasDivisionWord && hasMultiDigitNumber;
}

export function renderLongDivisionGuide(rawText) {
  if (!hasLongDivisionCandidate(rawText)) return '';

  return `
    <div class="card answer-card column-guide-card" aria-label="Подсказка по делению столбиком">
      <div class="section-overline">Деление столбиком</div>
      <h3 class="section-title column-guide-title">Когда в делении есть число из двух и более цифр, добавляем способ решения столбиком</h3>
      <p class="section-sub column-guide-sub">Сам образец ниже нужен как визуальная подсказка. В озвучивание он не входит.</p>

      <div class="column-guide-grid">
        <div class="column-guide-text">
          <div class="column-steps-grid">
            <div class="column-step"><span class="column-step-index">1</span><span>Смотрим, какая часть делимого берётся первой.</span></div>
            <div class="column-step"><span class="column-step-index">2</span><span>Подбираем цифру частного и записываем её сверху.</span></div>
            <div class="column-step"><span class="column-step-index">3</span><span>Умножаем делитель на эту цифру и записываем результат под выбранной частью.</span></div>
            <div class="column-step"><span class="column-step-index">4</span><span>Вычитаем, затем сносим следующую цифру.</span></div>
            <div class="column-step"><span class="column-step-index">5</span><span>Повторяем шаги, пока цифры не закончатся.</span></div>
            <div class="column-step"><span class="column-step-index">6</span><span>Если в конце получилось 0, деление выполнено без остатка.</span></div>
          </div>
          <div class="column-note">Совет: в столбик удобно идти сверху вниз и после каждого шага проверять вычитание.</div>
        </div>

        <div class="column-visual-wrap">
          <div class="long-division-board" aria-hidden="true">
            <div class="ld-cell digit" style="grid-column:2;grid-row:1;">4</div>
            <div class="ld-cell digit" style="grid-column:3;grid-row:1;">2</div>
            <div class="ld-cell digit" style="grid-column:4;grid-row:1;">9</div>
            <div class="ld-cell digit" style="grid-column:5;grid-row:1;">3</div>

            <div class="ld-cell quotient-line" style="grid-column:5 / span 4;grid-row:2;"></div>
            <div class="ld-cell divider-line-vertical" style="grid-column:5;grid-row:1 / span 4;"></div>

            <div class="ld-cell digit" style="grid-column:5;grid-row:3;">1</div>
            <div class="ld-cell digit" style="grid-column:6;grid-row:3;">4</div>
            <div class="ld-cell digit" style="grid-column:7;grid-row:3;">3</div>

            <div class="ld-cell digit" style="grid-column:2;grid-row:3;">3</div>
            <div class="ld-cell digit" style="grid-column:2;grid-row:4;">1</div>
            <div class="ld-cell digit" style="grid-column:3;grid-row:4;">2</div>
            <div class="ld-cell digit" style="grid-column:2;grid-row:5;">1</div>
            <div class="ld-cell digit" style="grid-column:3;grid-row:5;">2</div>
            <div class="ld-cell digit" style="grid-column:4;grid-row:6;">9</div>
            <div class="ld-cell digit" style="grid-column:4;grid-row:7;">9</div>
            <div class="ld-cell digit" style="grid-column:4;grid-row:8;">0</div>

            <div class="ld-cell short-line" style="grid-column:1;grid-row:2;"></div>
            <div class="ld-cell short-line" style="grid-column:1;grid-row:4;"></div>
            <div class="ld-cell short-line" style="grid-column:3;grid-row:6;"></div>

            <div class="ld-cell underline" style="grid-column:2 / span 3;grid-row:2;"></div>
            <div class="ld-cell underline" style="grid-column:2 / span 1;grid-row:4;"></div>
            <div class="ld-cell underline" style="grid-column:2 / span 2;grid-row:5;"></div>
            <div class="ld-cell underline" style="grid-column:4 / span 1;grid-row:7;"></div>
          </div>
          <figure class="column-guide-figure">
            <img src="./src/assets/long-division-example.webp" alt="Пример деления столбиком" class="column-guide-image" />
            <figcaption>Пример изображения для ориентира по расположению чисел.</figcaption>
          </figure>
        </div>
      </div>
    </div>
  `;
}
