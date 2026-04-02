export function renderSolveScreen({ t, state }) {
  const hasResult = Boolean((state.currentResult || '').trim());
  return `
    <section class="screen ${state.route === 'solve' ? 'active' : ''}" data-screen="solve">
      <div class="card glass-card">
        <div class="section-overline">Новая задача</div>
        <h2 class="section-title">${t('solver.title')}</h2>
        <p class="section-sub">Введите условие задачи. Мы покажем ход мысли, решение и ответ.</p>
        <textarea id="taskInput" class="input" placeholder="${t('solver.placeholder')}">${state.draft || ''}</textarea>
        <div class="row" style="margin-top:12px;">
          <button class="primary" id="solveBtn">Объяснить</button>
        </div>
      </div>

      <div class="card answer-card">
        <h2 class="section-title">Ответ</h2>
        <div id="resultBox" class="result">${hasResult ? state.currentResult : 'Здесь появится объяснение задачи.'}</div>
        <div class="toolbar-grid" style="margin-top:12px;">
          <button class="tool-btn" id="copyBtn">Скопировать</button>
          <button class="tool-btn" id="voiceBtn">Озвучить</button>
          <button class="tool-btn" data-nav="history">История</button>
        </div>
      </div>
    </section>
  `;
}
