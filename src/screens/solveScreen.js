import { escapeHtml, getTaskTypeLabel, formatAssistantTextForHtml } from '../utils/text.js';

export function renderSolveScreen({ state }) {
  const rawResult = (state.currentResult || '').trim();
  const hasResult = Boolean(rawResult);
  const safeDraft = escapeHtml(state.draft || '');
  const examples = [
    'Задача: У Маши было 7 яблок, 2 она отдала подруге. Сколько осталось?',
    'Пример: 36 + 18',
    'Уравнение: x * 9 = 27',
    'Дроби: 1/2 + 1/4',
    'Геометрия: Найди периметр прямоугольника со сторонами 5 см и 3 см'
  ].join('\n');

  const quickExamples = [
    ['text', 'Текстовая задача', 'У Пети было 12 карандашей. 5 он отдал. Сколько осталось?'],
    ['example', 'Пример', '48 + 27'],
    ['equation', 'Уравнение', 'x * 8 = 56'],
    ['fractions', 'Дроби', '3/4 - 1/4']
  ];

  const currentType = getTaskTypeLabel(state.draft || state.currentResult || '');
  const resultHtml = hasResult
    ? formatAssistantTextForHtml(rawResult)
    : '<div class="result-placeholder">Здесь появится объяснение, ответ и короткий совет.</div>';

  return `
    <section class="screen ${state.route === 'solve' ? 'active' : ''}" data-screen="solve">
      <div class="card glass-card solve-hero-card raster-card raster-card-solve">
        <div class="solve-topline">Решайка</div>
        <div class="solve-hero-grid">
          <div>
            <h1 class="solve-title">Понятное объяснение задачи без лишних слов</h1>
            <div class="solve-main-subtitle">Вставьте условие задачи, пример, уравнение или дроби. Приложение объяснит ход решения спокойным школьным языком.</div>
          </div>
          <div class="solve-status-stack">
            <div class="hero-status-pill hero-status-pill-compact">
              <span>Формат</span>
              <b>${escapeHtml(currentType)}</b>
            </div>
            <div class="hero-status-pill hero-status-pill-compact">
              <span>Режим</span>
              <b>Объяснение + ответ</b>
            </div>
          </div>
        </div>

        <div class="quick-pills-row">
          ${quickExamples.map(([kind, label, text]) => `
            <button class="quick-chip" type="button" data-example-fill="${escapeHtml(text)}" data-example-kind="${kind}">${escapeHtml(label)}</button>
          `).join('')}
        </div>

        <div class="input-shell">
          <textarea
            id="taskInput"
            class="input input-task"
            placeholder="${escapeHtml(examples)}"
            aria-label="Поле для ввода задачи"
          >${safeDraft}</textarea>
        </div>
        <div class="row solve-actions-row">
          <button class="primary primary-wide" id="solveBtn">Объяснить задачу</button>
          <button class="secondary" type="button" data-clear-task="true">Очистить</button>
        </div>
      </div>

      <div class="card answer-card result-card raster-card raster-card-result">
        <div class="result-head">
          <div>
            <div class="section-overline result-overline">Результат</div>
            <h2 class="section-title">Объяснение</h2>
          </div>
          <div class="result-head-tools">
            <button class="icon-btn" id="favoriteBtn" aria-label="Добавить последнее решение в избранное" title="Добавить в избранное">
              <span class="icon-favorite" aria-hidden="true"></span>
            </button>
            <button class="icon-btn" id="copyBtn" aria-label="Скопировать" title="Скопировать">
              <span class="icon-copy" aria-hidden="true"></span>
            </button>
          </div>
        </div>

        <div id="resultBox" class="result rich-result">${resultHtml}</div>

        <div class="tool-cluster" style="margin-top:12px;">
          <span class="tool-cluster-label">Озвучивание</span>
          <div class="voice-toolbar voice-toolbar-compact">
            <button class="tool-btn tool-btn-icon" id="voiceBtn" aria-label="Озвучивать" title="Озвучивать">
              <span class="icon-speak" aria-hidden="true"></span>
            </button>
            <button class="tool-btn tool-btn-icon" id="pauseVoiceBtn" aria-label="Пауза" title="Пауза / Продолжить">
              <span class="icon-playpause" aria-hidden="true"></span>
            </button>
          </div>
        </div>
      </div>
    </section>
  `;
}
