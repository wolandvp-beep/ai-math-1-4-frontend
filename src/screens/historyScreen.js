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

export function renderHistoryScreen({ t, state }) {
  const items = filterItems(state);

  return `
    <section class="screen ${state.route === 'history' ? 'active' : ''}" data-screen="history">
      <div class="card panel">
        <h2 class="section-title">История</h2>
        <input id="historySearch" class="search" placeholder="${t('history.search')}" value="${state.historyQuery || ''}" />
      </div>

      <div class="card panel">
        ${items.length ? `<div class="list">
          ${items.map(item => `
            <div class="item item-history">
              <div>
                <div class="item-title">${item.task}</div>
                <div class="muted small">${String(item.result).slice(0, 170)}${String(item.result).length > 170 ? '…' : ''}</div>
              </div>
              <div class="item-actions">
                <span class="item-badge">Решение</span>
                <button class="history-open-btn" data-history-open="${item.id}">Открыть</button>
              </div>
            </div>
          `).join('')}
        </div>` : `<div class="empty">${t('history.empty')}</div>`}
      </div>
    </section>
  `;
}
