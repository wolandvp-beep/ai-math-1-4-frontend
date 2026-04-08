import { renderExplanationWithColumns } from '../components/columnMathRenderer.js';

export function renderSolveScreen({ state }) {
  const hasResult = Boolean((state.currentResult || '').trim());
  const examples = [
    'Задача: У Маши было 7 яблок, 2 она отдала подруге. Сколько осталось?',
    'Пример: 36 + 18',
    'Уравнение: x * 9 = 27',
    'Дроби: 1/2 + 1/4',
    'Геометрия: Найди периметр прямоугольника со сторонами 5 см и 3 см'
  ].join('\n');

  const resultContent = hasResult
    ? renderExplanationWithColumns({
        explanationText: state.currentResult,
        taskText: state.draft || ''
      })
    : renderExplanationWithColumns({
        explanationText: '',
        taskText: ''
      });

  return `
    <section class="screen ${state.route === 'solve' ? 'active' : ''}" data-screen="solve">
      <div class="card glass-card solve-hero-card">
        <div class="solve-topline">Решайка</div>
        <div class="solve-main-subtitle">Введите условие задачи, пример, уравнение или математический вопрос.</div>
        <div class="input-shell">
          <textarea
            id="taskInput"
            class="input input-task"
            placeholder="${examples}"
            aria-label="Поле для ввода задачи"
          >${state.draft || ''}</textarea>
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
        <div id="resultBox" class="result">${resultContent}</div>
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
