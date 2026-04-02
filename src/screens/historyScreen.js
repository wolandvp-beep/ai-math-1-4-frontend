import { escapeHtml, getTaskTypeLabel, truncateText } from '../utils/text.js';

function filterItems(state) {
  const q = (state.historyQuery || '').toLowerCase().trim();
  let items = state.history;

  if (state.historyMode === 'favorites') {
    const favorites = new Set(state.favorites || []);
    items = items.filter(item => favorites.has(item.id));
  }

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

function getDateGroupLabel(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Ранее';

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (target.getTime() === today.getTime()) return 'Сегодня';
  if (target.getTime() === yesterday.getTime()) return 'Вчера';
  return 'Ранее';
}

function groupItems(items) {
  return items.reduce((acc, item) => {
    const key = getDateGroupLabel(item.createdAt);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
}

export function renderHistoryScreen({ state }) {
  const items = filterItems(state);
  const groups = groupItems(items);
  const modeAll = state.historyMode !== 'favorites';

  return `
    <section class="screen ${state.route === 'history' ? 'active' : ''}" data-screen="history">
      <div class="card glass-card raster-card raster-card-history">
        <div class="section-overline">История</div>
        <h2 class="section-title">Прошлые объяснения</h2>
        <p class="section-sub">Возвращайтесь к прошлым задачам, ищите по словам и сохраняйте важные карточки в избранное.</p>

        <div class="history-toolbar">
          <input id="historySearch" class="search" placeholder="Поиск по истории" value="${escapeHtml(state.historyQuery || '')}" />
          <div class="history-tabs" role="tablist" aria-label="Режим истории">
            <button id="historyAllBtn" type="button" class="history-tab ${modeAll ? 'active' : ''}">Все</button>
            <button id="historyFavBtn" type="button" class="history-tab ${!modeAll ? 'active' : ''}">Избранное</button>
          </div>
        </div>
      </div>

      <div class="card answer-card history-list-card">
        ${items.length ? Object.entries(groups).map(([group, groupItems]) => `
          <div class="history-group">
            <div class="history-group-title">${escapeHtml(group)}</div>
            <div class="list">
              ${groupItems.map(item => {
                const isFavorite = (state.favorites || []).includes(item.id);
                return `
                  <button class="item item-history item-history-card" type="button" data-history-open="${item.id}" aria-label="Открыть объяснение от ${escapeHtml(formatDateTime(item.createdAt))}">
                    <div class="history-card-top">
                      <span class="history-badge">${escapeHtml(getTaskTypeLabel(item.task || ''))}</span>
                      <span class="item-history-meta">${escapeHtml(formatDateTime(item.createdAt))}</span>
                    </div>
                    <div class="item-title">${escapeHtml(truncateText(item.task || '', 120))}</div>
                    <div class="muted small">${escapeHtml(truncateText(item.result || '', 180))}</div>
                    <div class="history-card-bottom">
                      <span class="history-open-hint">Открыть полностью</span>
                      ${isFavorite ? '<span class="history-fav-mark">★ В избранном</span>' : ''}
                    </div>
                  </button>
                `;
              }).join('')}
            </div>
          </div>
        `).join('') : `<div class="empty">Пока история пустая. Решите первую задачу — и она появится здесь.</div>`}
      </div>
    </section>
  `;
}
