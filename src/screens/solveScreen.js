import { escapeHtml, formatExplanationSections } from '../utils/text.js';

export function renderSolveScreen({ state }) {
  const hasResult = Boolean((state.currentResult || '').trim());
  const isSolving = Boolean(state.isSolving);
  const canUseResultTools = hasResult && !isSolving;
  const sections = formatExplanationSections(state.currentResult || '');
  const hintExamples = [
    'Например: 36 + 18',
    'или: x * 9 = 27',
    'или: у Маши было 7 яблок, 2 она отдала'
  ];

  return `
    <section class="screen ${state.route === 'solve' ? 'active' : ''}" data-screen="solve">
      <div class="card glass-card solve-hero-card">
        <div class="solve-topline">Решение с объяснением</div>
        <div class="solve-main-subtitle">Введите задачу, пример или уравнение — приложение покажет ход решения и короткий итог.</div>
        <div class="solve-helper-strip">
          ${hintExamples.map(example => `<span class="solve-helper-chip">${escapeHtml(example)}</span>`).join('')}
        </div>
        <div class="input-shell">
          <textarea
            id="taskInput"
            class="input input-task"
            placeholder="Введите задачу своими словами"
            aria-label="Поле для ввода задачи"
            ${isSolving ? 'disabled' : ''}
          >${escapeHtml(state.draft || '')}</textarea>
        </div>
        <div class="row solve-actions-row">
          <button class="primary primary-wide" id="solveBtn" ${isSolving ? 'disabled' : ''}>${isSolving ? 'Думаю...' : 'Показать решение'}</button>
        </div>
      </div>

      <div class="card answer-card result-card ${isSolving ? 'result-card-loading' : ''}">
        <div class="result-head">
          <div>
            <h2 class="section-title">Разбор решения</h2>
            <p class="result-subtitle">${state.activeHistoryItemId ? 'Открыто сохранённое объяснение из истории.' : 'Здесь появится понятное пошаговое объяснение.'}</p>
          </div>
          <button class="icon-btn ${canUseResultTools ? '' : 'is-disabled'}" id="copyBtn" aria-label="Скопировать" title="Скопировать" ${canUseResultTools ? '' : 'disabled'}>
            <span class="icon-copy" aria-hidden="true"></span>
          </button>
        </div>
        <div id="resultBox" class="result ${hasResult ? 'has-content' : 'is-empty'}">
          ${isSolving ? `
            <div class="result-loading">
              <span class="result-loading-dot"></span>
              <div>
                <div class="result-loading-title">Собираю объяснение</div>
                <div class="result-loading-text">Покажу ход решения и короткий итог в одном экране.</div>
              </div>
            </div>
          ` : hasResult ? `
            <div class="result-layout">
              <div class="result-section">
                <div class="result-section-label">Ход решения</div>
                <div class="result-text">${escapeHtml(sections.explanation || state.currentResult)}</div>
              </div>
              ${sections.answer ? `
                <div class="result-summary-box">
                  <div class="result-section-label">${escapeHtml(sections.answerLabel)}</div>
                  <div class="result-summary-text">${escapeHtml(sections.answer)}</div>
                </div>
              ` : ''}
            </div>
          ` : `
            <div class="result-empty-state">
              <div class="result-empty-title">Здесь появится решение</div>
              <div class="result-empty-text">Сначала введите задачу, затем нажмите «Показать решение».</div>
            </div>
          `}
        </div>
        <div class="tool-cluster" style="margin-top:12px;">
          <span class="tool-cluster-label">Озвучивание</span>
          <div class="voice-toolbar voice-toolbar-compact">
            <button class="tool-btn tool-btn-icon ${canUseResultTools ? '' : 'is-disabled'}" id="voiceBtn" aria-label="Озвучивать" title="Озвучивать" ${canUseResultTools ? '' : 'disabled'}>
              <span class="icon-speak" aria-hidden="true"></span>
            </button>
            <button class="tool-btn tool-btn-icon ${canUseResultTools ? '' : 'is-disabled'}" id="pauseVoiceBtn" aria-label="Пауза" title="Пауза / Продолжить" ${canUseResultTools ? '' : 'disabled'}>
              <span class="icon-playpause" aria-hidden="true"></span>
            </button>
          </div>
        </div>
      </div>
    </section>
  `;
}
