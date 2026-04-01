const EXAMPLE_TASK = 'Задача: У Маши было 3 яблока, мама дала ещё 2. Сколько стало яблок?';

export function renderSolveScreen({ t, state }) {
  const hasResult = Boolean((state.currentResult || '').trim());
  const initialText = state.draft || '';
  const examples = [
    { type: 'Задача', text: 'Задача: У Маши было 3 яблока, мама дала ещё 2. Сколько стало?' },
    { type: 'Пример', text: 'Пример: 48 + 27' },
    { type: 'Уравнение', text: 'Уравнение: x + 6 = 15' },
    { type: 'Выражение', text: 'Выражение: (12 - 4) + 7' }
  ];

  return `
    <section class="screen ${state.route === 'solve' ? 'active' : ''}" data-screen="solve">
      <div class="card glass-card premium-card composer-card skyline-scene-card skyline-scene-solve v23-solve-stage">
        <div class="v23-stage-grid">
          <div class="v23-stage-copy">
            <div class="section-overline">Световая консоль</div>
            <div class="panel-header-row v23-stage-head">
              <div>
                <h2 class="section-title">${t('solver.title')}</h2>
                <p class="section-sub">Пиши свободно: задача, пример, уравнение или выражение. Решайка соберёт понятное объяснение как из футуристической обучающей системы.</p>
              </div>
              <div class="panel-badge">Neon Solve Core</div>
            </div>

            <div class="examples-strip examples-strip-rich skyline-example-strip v23-example-grid">
              ${examples.map((example, index) => `
                <button class="example-chip example-card skyline-example-card v23-example-card v23-example-${index + 1}" type="button" data-example-fill="${example.text.replace(/"/g, '&quot;')}">
                  <span class="example-index">0${index + 1}</span>
                  <span class="v23-example-meta">${example.type}</span>
                  <span class="example-text">${example.text}</span>
                </button>`).join('')}
            </div>
          </div>

          <div class="v23-side-pulse">
            <div class="v23-orbit-card">
              <span class="v23-orbit-label">Форматы ввода</span>
              <strong>Задача • Пример • Уравнение • Выражение</strong>
              <small>Внутри одной художественной консоли без лишнего шума.</small>
            </div>
            <div class="v23-orbit-lines"></div>
          </div>
        </div>

        <div class="input-shell input-shell-premium skyline-input-shell v23-input-shell">
          <div class="input-shell-glow"></div>
          <div class="v23-input-topline">
            <div class="input-hints v23-input-hints">
              <span>Задача</span>
              <span>Пример</span>
              <span>Уравнение</span>
              <span>Выражение</span>
            </div>
            <div class="tiny-chip v23-chip">Готово к вводу</div>
          </div>
          <textarea id="taskInput" data-example="${EXAMPLE_TASK.replace(/"/g, '&quot;')}" class="input premium-input v23-premium-input" placeholder="Например: Задача: В коробке было 8 карандашей, 3 подарили другу. Сколько осталось?&#10;Или: Пример: 36 + 19&#10;Или: Уравнение: x - 4 = 11&#10;Или: Выражение: (12 + 7) - 5" spellcheck="false">${initialText}</textarea>
          <div class="input-footer-grid skyline-input-footer v23-input-footer">
            <div class="tiny-status v23-status-line">Пиши своим языком. Решайка сама определит формат и объяснит ход мысли.</div>
            <div class="v23-console-stats">
              <span>Голограмма</span>
              <span>Мягкое свечение</span>
              <span>Детский sci-fi</span>
            </div>
          </div>
        </div>

        <div class="row solve-row v23-solve-row">
          <button class="primary primary-hero solve-cta v23-solve-cta" id="solveBtn">Начать разбор</button>
          <div class="tiny-status v23-secondary-note">Ответ появится ниже как большая неоновая карта решения.</div>
        </div>
      </div>

      <div class="card answer-card premium-card answer-premium skyline-scene-card skyline-scene-answer v23-answer-stage">
        <div class="panel-header-row v23-answer-head">
          <div>
            <div class="section-overline">Голограмма ответа</div>
            <h2 class="section-title">Ответ</h2>
            <p class="section-sub">Сначала короткая мысль, потом решение, ответ и маленькое правило для похожих задач.</p>
          </div>
          <div class="answer-status v23-answer-status">Озвучка подключена</div>
        </div>
        <div class="v23-answer-frame">
          <div class="v23-answer-beam"></div>
          <div id="resultBox" class="result premium-result skyline-result-panel v23-result-panel">${hasResult ? state.currentResult : 'Здесь появится объяснение задачи, примера, уравнения или выражения. Сначала будет короткая мысль, потом решение и ответ.'}</div>
        </div>
        <div class="toolbar-grid toolbar-grid-4 tool-cluster tool-cluster-premium skyline-tool-cluster v23-tool-cluster" style="margin-top:12px;">
          <button class="tool-btn icon-tool-btn v23-tool-btn" id="copyBtn" aria-label="Скопировать" title="Скопировать">
            <img src="./src/assets/generated/icon-copy.svg" alt="" />
          </button>
          <button class="tool-btn icon-tool-btn voice-main v23-tool-btn v23-tool-main" id="voiceBtn" aria-label="Озвучить" title="Озвучить">
            <img src="./src/assets/generated/icon-voice.svg" alt="" />
          </button>
          <button class="tool-btn icon-tool-btn v23-tool-btn" id="pauseVoiceBtn" aria-label="Пауза" title="Пауза">
            <img src="./src/assets/generated/icon-pause.svg" alt="" />
          </button>
          <button class="tool-btn icon-tool-btn v23-tool-btn" id="stopVoiceBtn" aria-label="Стоп" title="Стоп">
            <img src="./src/assets/generated/icon-stop.svg" alt="" />
          </button>
        </div>
      </div>
    </section>
  `;
}
