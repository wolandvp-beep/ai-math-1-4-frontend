const EXAMPLES = [
  'Задача: у Маши было 3 яблока, мама дала ещё 2. Сколько стало яблок?',
  'Пример: 48 ÷ 6',
  'Уравнение: 2x + 5 = 17',
  'Вопрос: как найти площадь прямоугольника 7 × 4?'
];

const DEFAULT_EXAMPLE = EXAMPLES[0];

export function renderSolveScreen({ t, state }) {
  const hasResult = Boolean((state.currentResult || '').trim());
  const initialText = state.draft || DEFAULT_EXAMPLE;
  const exampleClass = state.draft ? '' : ' example-text';

  return `
    <section class="screen ${state.route === 'solve' ? 'active' : ''}" data-screen="solve">
      <div class="card glass-card neon-panel">
        <div class="section-overline">Поле задачи</div>
        <h2 class="section-title">${t('solver.title')}</h2>
        <p class="section-sub">Введите условие задачи, примера, уравнения или вопроса. Мы покажем ход мысли, решение и ответ.</p>

        <div class="prompt-chip-grid">
          ${EXAMPLES.map((item) => `
            <button class="prompt-chip" data-example-fill="${item.replace(/"/g, '&quot;')}">${item}</button>
          `).join('')}
        </div>

        <div class="input-frame">
          <div class="input-frame-label">Голографический ввод</div>
          <textarea id="taskInput" data-example="${DEFAULT_EXAMPLE.replace(/"/g, '&quot;')}" class="input${exampleClass}" placeholder="" spellcheck="false">${initialText}</textarea>
        </div>

        <div class="row" style="margin-top:12px;">
          <button class="primary" id="solveBtn">Объяснить</button>
        </div>
      </div>

      <div class="card answer-card neon-panel">
        <div class="answer-headline-wrap">
          <h2 class="section-title">Ответ</h2>
          <div class="answer-kicker">Панель расшифровки</div>
        </div>
        <div id="resultBox" class="result">${hasResult ? state.currentResult : 'Здесь появится объяснение задачи, примера, уравнения или краткого вопроса по математике.'}</div>
        <div class="toolbar-grid toolbar-grid-4 voice-toolbar" style="margin-top:12px;">
          <button class="tool-btn icon-tool-btn" id="copyBtn" aria-label="Скопировать" title="Скопировать">
            <img src="./src/assets/icon-copy.png" alt="Скопировать" class="tool-icon-img" />
          </button>
          <div class="voice-cluster">
            <button class="tool-btn icon-tool-btn voice-main-btn" id="voiceBtn" aria-label="Озвучить" title="Озвучить">
              <img src="./src/assets/icon-voice.png" alt="Озвучить" class="tool-icon-img" />
            </button>
            <button class="tool-btn icon-tool-btn" id="pauseVoiceBtn" aria-label="Пауза" title="Пауза">
              <img src="./src/assets/icon-pause.png" alt="Пауза" class="tool-icon-img" />
            </button>
            <button class="tool-btn icon-tool-btn" id="stopVoiceBtn" aria-label="Стоп" title="Стоп">
              <img src="./src/assets/icon-stop.png" alt="Стоп" class="tool-icon-img" />
            </button>
          </div>
        </div>
      </div>
    </section>
  `;
}
