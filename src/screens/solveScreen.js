
export function renderSolveScreen({ state }) {
  const hasResult = Boolean((state.currentResult || '').trim());
  const placeholder = [
    'Задача: У Маши было 3 яблока, мама дала ещё 2. Сколько стало яблок?',
    'Пример: 7 + 5',
    'Уравнение: x + 3 = 8',
    'Выражение: 12 - 4 + 6'
  ].join('\n\n');

  return `
    <section class="screen ${state.route === 'solve' ? 'active' : ''}" data-screen="solve">
      <div class="card panel-art panel-solve">
        <div class="section-overline">Новая задача</div>
        <h2 class="section-title">Поле ввода</h2>
        <p class="section-sub">Введите задачу, пример, уравнение или выражение. Мы покажем ход решения и ответ.</p>
        <textarea id="taskInput" class="input" placeholder="${placeholder}" spellcheck="false">${state.draft || ''}</textarea>
        <div class="row" style="margin-top:12px;">
          <button class="primary-btn" id="solveBtn">Начать</button>
        </div>
      </div>

      <div class="card">
        <div class="section-overline">Ответ</div>
        <h2 class="section-title">Объяснение</h2>
        <div id="resultBox" class="result">${hasResult ? state.currentResult : 'Здесь появится объяснение задачи, примера, уравнения или выражения.'}</div>
        <div class="toolbar-grid" style="margin-top:12px;">
          <button class="tool-btn" id="copyBtn" title="Скопировать"><img src="./src/assets/tool-copy.png" alt="Скопировать"></button>
          <button class="tool-btn" id="voiceBtn" title="Озвучить"><img src="./src/assets/tool-voice.png" alt="Озвучить"></button>
          <button class="tool-btn" id="pauseVoiceBtn" title="Пауза"><img src="./src/assets/tool-pause.png" alt="Пауза"></button>
          <button class="tool-btn" id="stopVoiceBtn" title="Стоп"><img src="./src/assets/tool-stop.png" alt="Стоп"></button>
          <div class="tool-group-label">Озвучивание</div>
        </div>
      </div>
    </section>
  `;
}
