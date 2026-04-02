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
  return date.toLocaleString('ru-RU', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
}

export function renderHistoryScreen({ state }) {
  const items = filterItems(state);
  const total = items.length;
  return `
    <section class="screen ${state.route === 'history' ? 'active' : ''}" data-screen="history">
      <div class="card glass-card history-hero-card">
        <div class="screen-hero-art history-hero-art" aria-hidden="true"></div>
        <div class="section-overline">История</div>
        <h2 class="section-title premium-screen-title">Архив решений</h2>
        <p class="section-sub premium-screen-sub">Последние объяснения, быстрый поиск и повторный вход в уже решённые задачи.</p>
        <div class="hero-status-row profile-status-grid">
          <div class="hero-status-pill"><span>Записей</span><b>${total}</b></div>
          <div class="hero-status-pill"><span>Режим</span><b>Memory Core</b></div>
        </div>
      </div>
      <div class="card glass-card history-search-card">
        <input id="historySearch" class="search premium-search" placeholder="Поиск по истории" value="${state.historyQuery || ''}" />
      </div>
      <div class="card answer-card history-list-shell">
        ${items.length ? `<div class="list">${items.map(item => `
          <button class="item item-history item-history-card premium-history-card" type="button" data-history-open="${item.id}" aria-label="Открыть объяснение от ${formatDateTime(item.createdAt)}">
            <div class="history-card-topline">
              <div class="item-history-meta">${formatDateTime(item.createdAt)}</div>
              <div class="history-chip">Архив</div>
            </div>
            <div class="item-title">${item.task}</div>
            <div class="muted small">${String(item.result).slice(0, 180)}${String(item.result).length > 180 ? '…' : ''}</div>
          </button>`).join('')}</div>` : `
          <div class="premium-empty-state">
            <div class="state-icon state-empty" aria-hidden="true"></div>
            <div><div class="item-title">История пока пуста</div><div class="muted small">Решите первую задачу — и она появится здесь вместе с быстрым поиском и повторным входом.</div></div>
          </div>`}
      </div>
    </section>
  `;
}
