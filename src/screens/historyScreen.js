function filterItems(state) {
  const q = (state.historyQuery || '').toLowerCase().trim();
  let items = state.history || [];
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
      <div class="card holo">
        <h2 class="section-title">История решений</h2>
        <input id="historySearch" class="search" placeholder="Найти задачу, пример или уравнение" value="${state.historyQuery || ''}">
      </div>
      <div class="card">
        ${items.length ? `<div class="list">
          ${items.map(item => `
            <div class="item">
              <div class="item-title">${item.task}</div>
              <div class="muted small">${String(item.result).slice(0, 170)}${String(item.result).length > 170 ? '…' : ''}</div>
              <div class="item-actions">
                <span class="tag">Сохранено</span>
                <button class="open-btn" data-history-open="${item.id}">Начать</button>
              </div>
            </div>
          `).join('')}
        </div>` : `<div class="empty">Пока здесь ничего нет. После первого решения история появится автоматически.</div>`}
      </div>
    </section>
  `;
}
