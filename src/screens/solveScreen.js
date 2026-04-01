const EXAMPLE_TASK = 'У Маши было 3 яблока, мама дала ещё 2. Сколько стало яблок?';

export function renderSolveScreen({ t, state }) {
  const hasResult = Boolean((state.currentResult || '').trim());
  const initialText = state.draft || EXAMPLE_TASK;
  const exampleClass = state.draft ? '' : ' example-text';

  return `
    <section class="screen ${state.route === 'solve' ? 'active' : ''}" data-screen="solve">
      <div class="card glass-card">
        <div class="section-overline">Поле задачи</div>
        <h2 class="section-title">${t('solver.title')}</h2>
        <p class="section-sub">Введите условие задачи, примера или уравнения. Мы покажем ход мысли, решение и ответ.</p>
        <textarea id="taskInput" data-example="${EXAMPLE_TASK.replace(/"/g, '&quot;')}" class="input${exampleClass}" placeholder="" spellcheck="false">${initialText}</textarea>
        <div class="row" style="margin-top:12px;">
          <button class="primary" id="solveBtn">Объяснить</button>
        </div>
      </div>

      <div class="card answer-card">
        <h2 class="section-title">Ответ</h2>
        <div id="resultBox" class="result">${hasResult ? state.currentResult : 'Здесь появится объяснение задачи, примера или уравнения.'}</div>
        <div class="toolbar-grid toolbar-grid-4" style="margin-top:12px;">
          <button class="tool-btn" id="copyBtn">Скопировать</button>
          <button class="tool-btn" id="voiceBtn">Озвучить</button>
          <button class="tool-btn" id="pauseVoiceBtn">Пауза</button>
          <button class="tool-btn" id="stopVoiceBtn">Стоп</button>
        </div>
      </div>
    </section>
  `;
}
