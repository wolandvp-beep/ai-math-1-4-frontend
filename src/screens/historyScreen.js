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

function formatDateTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function renderHistoryScreen({ state }) {
  const items = filterItems(state);

  return `
    <section class="screen ${state.route === 'history' ? 'active' : ''}" data-screen="history">
      <div class="card glass-card">
        <div class="section-overline">История</div>
        <h2 class="section-title">Прошлые объяснения</h2>
        <p class="section-sub">Здесь сохраняются последние объяснения. Нажмите на карточку, чтобы открыть её полностью.</p>

        <div class="row history-toolbar">
          <input id="historySearch" class="search history-search" placeholder="Поиск по истории" value="${state.historyQuery || ''}" />
          <button id="clearHistoryBtn" class="secondary" type="button">Очистить историю</button>
        </div>
      </div>

      <div class="card answer-card">
        ${items.length ? `<div class="list">
          ${items.map(item => `
            <button class="item item-history item-history-card" type="button" data-history-open="${item.id}" aria-label="Открыть объяснение от ${formatDateTime(item.createdAt)}">
              <div class="item-history-meta">${formatDateTime(item.createdAt)}</div>
              <div class="item-title">${item.task}</div>
              <div class="muted small">${String(item.result).slice(0, 180)}${String(item.result).length > 180 ? '…' : ''}</div>
            </button>
          `).join('')}
        </div>` : `<div class="empty">Пока история пуста. Решите первую задачу — и она появится здесь.</div>`}
      </div>
    </section>
  `;
}
