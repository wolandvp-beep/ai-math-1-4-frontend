function filterItems(state) {
  const q = (state.historyQuery || '').toLowerCase().trim();
  let items = state.history;
  if (state.historyMode === 'favorites') {
    items = items.filter(item => state.favorites.includes(item.id));
  }
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
      <div class="card">
        <div class="top-chip">🕘 История и избранное</div>
        <h2 class="section-title">${t('history.title')}</h2>
        <input id="historySearch" class="search" placeholder="${t('history.search')}" value="${state.historyQuery || ''}" />
        <div class="pill-group" style="margin-top:12px;">
          <button class="pill ${state.historyMode === 'all' ? 'active' : ''}" id="historyAllBtn">${t('history.all')}</button>
          <button class="pill ${state.historyMode === 'favorites' ? 'active' : ''}" id="historyFavBtn">${t('history.favorites')}</button>
        </div>
      </div>

      <div class="card">
        ${items.length ? `<div class="list">
          ${items.map(item => `
            <div class="item item-history">
              <div>
                <div class="item-title">${item.task}</div>
                <div class="muted small">${String(item.result).slice(0, 170)}${String(item.result).length > 170 ? '…' : ''}</div>
              </div>
              <div class="item-actions">
                <span class="item-badge">${state.favorites.includes(item.id) ? '⭐ Избранное' : '📘 Решение'}</span>
                <button class="history-open-btn" data-history-open="${item.id}">Открыть</button>
              </div>
            </div>
          `).join('')}
        </div>` : `<div class="empty">${t('history.empty')}</div>`}
      </div>
    </section>
  `;
}
