export function renderSolveScreen({ t, state }) {
  return `
    <section class="screen ${state.route === 'solve' ? 'active' : ''}" data-screen="solve">
      <div class="card">
        <h2 class="section-title">${t('solver.title')}</h2>
        <textarea id="taskInput" class="input" placeholder="${t('solver.placeholder')}">${state.draft || ''}</textarea>
        <div class="row" style="margin-top:12px;">
          <button class="primary" id="solveBtn">${t('solver.solve')}</button>
          <button class="secondary" id="copyBtn">${t('solver.copy')}</button>
          <button class="secondary" id="favoriteBtn">${t('solver.favorite')}</button>
          <button class="secondary" id="voiceBtn">${t('solver.voice')}</button>
        </div>
      </div>
      <div class="card">
        <div id="resultBox" class="result">${state.currentResult || 'Здесь появится объяснение.'}</div>
      </div>
    </section>
  `;
}
