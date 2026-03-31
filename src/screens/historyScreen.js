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
        <h2 class="section-title">${t('history.title')}</h2>
        <input id="historySearch" class="search" placeholder="${t('history.search')}" value="${state.historyQuery || ''}" />
        <div class="row" style="margin-top:12px;">
          <button class="${state.historyMode === 'all' ? 'primary' : 'secondary'}" id="historyAllBtn">${t('history.all')}</button>
          <button class="${state.historyMode === 'favorites' ? 'primary' : 'secondary'}" id="historyFavBtn">${t('history.favorites')}</button>
        </div>
      </div>
      <div class="card">
        ${items.length ? `<div class="list">
          ${items.map(item => `
            <button class="item" data-history-open="${item.id}">
              <div class="item-title">${item.task}</div>
              <div class="muted small">${String(item.result).slice(0, 180)}${String(item.result).length > 180 ? '…' : ''}</div>
            </button>
          `).join('')}
        </div>` : `<div class="empty">${t('history.empty')}</div>`}
      </div>
    </section>
  `;
}
