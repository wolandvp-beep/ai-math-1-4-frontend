export function renderSolveScreen({ t, state }) {
  const hasResult = Boolean((state.currentResult || '').trim());
  const examples = [
    'Задача: У Маши было 7 яблок, 2 она отдала подруге. Сколько осталось?',
    'Пример: 36 + 18',
    'Уравнение: x + 9 = 17',
    'Дроби: 1/2 + 1/4',
    'Геометрия: Найди периметр прямоугольника со сторонами 5 и 3'
  ];

  return `
    <section class="screen ${state.route === 'solve' ? 'active' : ''}" data-screen="solve">
      <div class="card glass-card neon-panel solve-panel">
        <div class="section-overline hologram-badge">Новая задача</div>
        <h2 class="section-title">${t('solver.title')}</h2>
        <p class="section-sub">Введите условие задачи, пример, уравнение или короткий математический вопрос.</p>
        <div class="input-shell">
          <textarea id="taskInput" class="input neon-input" placeholder="${t('solver.placeholder')}">${state.draft || ''}</textarea>
          <div class="example-hint">Можно написать так:</div>
          <div class="example-grid">
            ${examples.map(example => `<button class="example-chip" type="button" data-example="${example.replace(/"/g, '&quot;')}">${example}</button>`).join('')}
          </div>
        </div>
        <div class="row" style="margin-top:14px;">
          <button class="primary neon-cta" id="solveBtn">Объяснить</button>
        </div>
      </div>

      <div class="card answer-card neon-panel answer-panel">
        <div class="answer-header">
          <h2 class="section-title">Ответ</h2>
          <div class="answer-caption">Совет, решение и ответ — в одном окне</div>
        </div>
        <div id="resultBox" class="result futuristic-result">${hasResult ? state.currentResult : 'Здесь появится объяснение задачи.'}</div>
        <div class="toolbar-grid toolbar-grid-icons" style="margin-top:12px;">
          <button class="tool-btn icon-only" id="copyBtn" aria-label="Скопировать" title="Скопировать">
            <span class="tool-glyph glyph-copy"></span>
          </button>
          <button class="tool-btn icon-only" id="voiceBtn" aria-label="Озвучить" title="Озвучить">
            <span class="tool-glyph glyph-voice"></span>
          </button>
          <button class="tool-btn icon-only" id="pauseBtn" aria-label="Пауза озвучивания" title="Пауза озвучивания">
            <span class="tool-glyph glyph-pause"></span>
          </button>
          <button class="tool-btn icon-only" id="stopBtn" aria-label="Остановить озвучивание" title="Остановить озвучивание">
            <span class="tool-glyph glyph-stop"></span>
          </button>
          <button class="tool-btn icon-only" data-nav="history" aria-label="История" title="История">
            <span class="tool-glyph glyph-history"></span>
          </button>
        </div>
      </div>
    </section>
  `;
}
