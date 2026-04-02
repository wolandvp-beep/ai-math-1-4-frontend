import { detectTaskKind, escapeAttribute, escapeHtml, summarizeHistoryResult } from '../utils/text.js';

function filterItems(state) {
  const query = String(state.historyQuery || '').trim().toLowerCase();
  if (!query) return state.history;
  return state.history.filter(item => {
    const task = String(item.task || '').toLowerCase();
    const result = String(item.result || '').toLowerCase();
    return task.includes(query) || result.includes(query);
  });
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
  const hasQuery = Boolean(String(state.historyQuery || '').trim());

  return `
    <section class="screen ${state.route === 'history' ? 'active' : ''}" data-screen="history">
      <div class="card glass-card history-head-card">
        <div class="section-overline">История</div>
        <h2 class="section-title">Прошлые объяснения</h2>
        <p class="section-sub">Найдите прошлую задачу, откройте её в один тап и продолжайте разбор с того же места.</p>
        <div class="history-search-row">
          <input id="historySearch" class="search" placeholder="Найти по задаче или ответу" value="${escapeAttribute(state.historyQuery || '')}" />
          ${hasQuery ? '<button class="secondary search-clear-btn" id="historySearchClear" type="button">Сбросить</button>' : ''}
        </div>
      </div>

      <div class="card answer-card history-list-card">
        ${items.length ? `<div class="list">
          ${items.map(item => {
            const kind = detectTaskKind(item.task);
            const snippet = summarizeHistoryResult(item.result, 140);
            const isActive = state.activeHistoryItemId === item.id;
            return `
              <button class="item item-history item-history-card ${isActive ? 'is-active' : ''}" type="button" data-history-open="${item.id}" aria-label="Открыть объяснение от ${escapeAttribute(formatDateTime(item.createdAt))}">
                <div class="item-history-topline">
                  <span class="history-kind-badge">${escapeHtml(kind)}</span>
                  <span class="item-history-meta">${escapeHtml(formatDateTime(item.createdAt))}</span>
                </div>
                <div class="item-title">${escapeHtml(item.task)}</div>
                <div class="history-snippet-label">Короткий итог</div>
                <div class="muted small history-snippet">${escapeHtml(snippet || 'Объяснение сохранено в истории.')}</div>
              </button>
            `;
          }).join('')}
        </div>` : `<div class="empty">${hasQuery ? 'По этому запросу ничего не найдено. Попробуйте другое слово или очистите поиск.' : 'Пока история пустая. Решите первую задачу — и она появится здесь.'}</div>`}
      </div>
    </section>
  `;
}
