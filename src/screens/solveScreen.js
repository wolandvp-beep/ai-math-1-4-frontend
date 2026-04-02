import { escapeHtml } from '../utils/text.js';
import { buildSolvePresentation } from '../utils/longArithmetic.js';

export function renderSolveScreen({ state }) {
  const examples = [
    'Задача: В библиотеке было 48 книг, 16 книг выдали. Сколько осталось?',
    'Пример: 428 + 176',
    'Пример: 902 - 187',
    'Пример: 34 × 27',
    'Пример: 429 : 3'
  ].join('\n');

  const presentation = buildSolvePresentation(state.draft || '', state.currentResult || '');

  return `
    <section class="screen ${state.route === 'solve' ? 'active' : ''}" data-screen="solve">
      <div class="card glass-card solve-hero-card">
        <div class="solve-topline">Решайка</div>
        <div class="solve-main-subtitle">Введите условие задачи, пример, уравнение или математический вопрос.</div>
        <div class="input-shell">
          <textarea
            id="taskInput"
            class="input input-task"
            placeholder="${escapeHtml(examples)}"
            aria-label="Поле для ввода задачи"
          >${escapeHtml(state.draft || '')}</textarea>
        </div>
        <div class="row solve-actions-row">
          <button class="primary primary-wide" id="solveBtn">Старт</button>
        </div>
      </div>

      <div class="card answer-card result-card">
        <div class="result-head">
          <h2 class="section-title">Объяснение</h2>
          <button class="icon-btn" id="copyBtn" aria-label="Скопировать" title="Скопировать">
            <span class="icon-copy" aria-hidden="true"></span>
          </button>
        </div>
        <div id="resultBox" class="result rich-result" data-copy-text="${escapeHtml(presentation.copyText)}" data-voice-text="${escapeHtml(presentation.voiceText)}">${presentation.html}</div>
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
