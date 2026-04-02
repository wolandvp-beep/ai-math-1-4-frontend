function filterItems(state) {
  const q = (state.historyQuery || '').toLowerCase().trim();
  let items = state.history;
  if (q) {
    items = items.filter(item =>
      (item.task || '').toLowerCase().includes(q) ||
      (item.result || '').toLowerCase().includes(q)
    );
  }
  return items;
}

export function renderHistoryScreen({ state }) {
  const items = filterItems(state);

  return `
    <section class="screen ${state.route === 'history' ? 'active' : ''}" data-screen="history">
      <div class="card glass-card">
        <div class="section-overline">История</div>
        <h2 class="section-title">Прошлые решения</h2>
        <p class="section-sub">Здесь сохраняются последние объяснения. Нажмите «Начать», чтобы вернуть задачу и ответ.</p>
        <input id="historySearch" class="search" placeholder="Поиск по истории" value="${state.historyQuery || ''}" />
      </div>

      <div class="card answer-card">
        ${items.length ? `<div class="list">
          ${items.map(item => `
            <div class="item item-history">
              <div>
                <div class="item-title">${item.task}</div>
                <div class="muted small">${String(item.result).slice(0, 180)}${String(item.result).length > 180 ? '…' : ''}</div>
              </div>
              <div class="item-actions">
                <span class="item-badge">Сохранённое решение</span>
                <button class="history-open-btn" data-history-open="${item.id}">Начать</button>
              </div>
            </div>
          `).join('')}
        </div>` : `<div class="empty">Пока история пустая. Решите первую задачу — и она появится здесь.</div>`}
      </div>
    </section>
  `;
}
