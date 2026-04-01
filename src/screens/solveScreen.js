export function renderSolveScreen({ state }) {
  const hasResult = Boolean((state.currentResult || '').trim());
  const placeholder = 'Например:\n• Задача: У Маши было 3 яблока, мама дала ещё 2. Сколько стало?\n• Пример: 47 + 28\n• Уравнение: x + 5 = 12\n• Ещё можно: 36 : 4 или 7 × 8';
  return `
    <section class="screen ${state.route === 'solve' ? 'active' : ''}" data-screen="solve">
      <img class="hero-art" src="./src/assets/hero-solve.png" alt="Неоновая математическая панель">
      <div class="card holo">
        <h2 class="section-title">Новая задача</h2>
        <p class="section-sub">Пишите сюда задачу, пример, уравнение или выражение. Всё разберём по шагам.</p>
        <textarea id="taskInput" class="input" placeholder="${placeholder}">${state.draft || ''}</textarea>
        <div class="row" style="margin-top:12px;">
          <button class="primary cta-wide" id="solveBtn">Начать</button>
        </div>
      </div>
      <div class="card">
        <h2 class="section-title">Объяснение</h2>
        <div id="resultBox" class="result">${hasResult ? state.currentResult : 'Здесь появится объяснение, решение и ответ.'}</div>
        <div class="tool-row" style="margin-top:12px;">
          <button class="icon-btn" id="copyBtn" title="Скопировать" aria-label="Скопировать">
            <img src="./src/assets/icon-copy.png" alt="Скопировать">
          </button>
          <div class="audio-group" aria-label="Управление озвучкой">
            <button class="icon-btn" id="voiceBtn" title="Озвучить" aria-label="Озвучить">
              <img src="./src/assets/icon-speak.png" alt="Озвучить">
            </button>
            <button class="icon-btn" id="pauseBtn" title="Пауза" aria-label="Пауза">
              <img src="./src/assets/icon-pause.png" alt="Пауза">
            </button>
            <button class="icon-btn" id="stopBtn" title="Стоп" aria-label="Стоп">
              <img src="./src/assets/icon-stop.png" alt="Стоп">
            </button>
          </div>
        </div>
      </div>
    </section>
  `;
}
