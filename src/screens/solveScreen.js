export function renderSolveScreen({ t, state }) {
  const hasResult = Boolean((state.currentResult || '').trim());
  return `
    <section class="screen ${state.route === 'solve' ? 'active' : ''}" data-screen="solve">
      <div class="card fun">
        <div class="top-chip">✨ Напиши задачу как тебе удобно</div>
        <h2 class="section-title">${t('solver.title')}</h2>
        <p class="section-sub">Мы сначала объясним ход мысли, потом покажем решение и короткое правило.</p>
        <textarea id="taskInput" class="input" placeholder="${t('solver.placeholder')}">${state.draft || ''}</textarea>
        <div class="row" style="margin-top:12px;">
          <button class="primary" id="solveBtn">💫 ${t('solver.solve')}</button>
        </div>
      </div>

      <div class="card">
        <h2 class="section-title">Объяснение</h2>
        <div id="resultBox" class="result">${hasResult ? state.currentResult : 'Здесь появится красивое объяснение с решением и ответом.'}</div>
        <div class="toolbar-grid" style="margin-top:12px;">
          <button class="tool-btn" id="copyBtn">📋 ${t('solver.copy')}</button>
          <button class="tool-btn" id="favoriteBtn">⭐ ${t('solver.favorite')}</button>
          <button class="tool-btn" id="voiceBtn">🔊 ${t('solver.voice')}</button>
          <button class="tool-btn" data-nav="history">🕘 История</button>
        </div>
      </div>
    </section>
  `;
}
