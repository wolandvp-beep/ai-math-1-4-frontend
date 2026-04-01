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

function detectKind(text) {
  const value = String(text || '').toLowerCase();
  if (value.includes('задача')) return 'Задача';
  if (value.includes('уравнение')) return 'Уравнение';
  if (value.includes('выражение')) return 'Выражение';
  return 'Пример';
}

function detectGlyph(kind) {
  if (kind === 'Задача') return '◈';
  if (kind === 'Уравнение') return '◎';
  if (kind === 'Выражение') return '⬡';
  return '✦';
}

function detectLine(kind) {
  if (kind === 'Задача') return 'Смысл → действие';
  if (kind === 'Уравнение') return 'Неизвестное → решение';
  if (kind === 'Выражение') return 'Порядок → вычисление';
  return 'Счёт → ответ';
}

export function renderHistoryScreen({ state }) {
  const items = filterItems(state);
  const favoritesCount = (state.favorites || []).length;

  return `
    <section class="screen ${state.route === 'history' ? 'active' : ''}" data-screen="history">
      <div class="card glass-card premium-card history-shell skyline-scene-card skyline-scene-history-head v24-history-hero v27-history-hero">
        <div class="v24-history-hero-grid v27-history-hero-grid">
          <div>
            <div class="section-overline">Неоновый архив</div>
            <h2 class="section-title">История решений</h2>
            <p class="section-sub">Каждое объяснение хранится как отдельный световой модуль в библиотеке города будущего. Здесь можно быстро найти прошлую задачу и снова открыть разбор.</p>
          </div>
          <div class="v27-history-sigil-panel">
            <img class="v27-history-sigil" src="./src/assets/generated/history-sigil.svg" alt="" />
            <div class="v27-history-sigil-copy">
              <span>Archive District</span>
              <strong>Лента сигналов • Модули • Возврат к решению</strong>
            </div>
          </div>
          <div class="v24-history-stat-cluster">
            <div class="v24-stat-pill"><span>Модули</span><b>${items.length}</b></div>
            <div class="v24-stat-pill"><span>Избранное</span><b>${favoritesCount}</b></div>
            <div class="v24-stat-pill"><span>Режим</span><b>Архив skyline</b></div>
          </div>
        </div>

        <div class="v24-history-search-row">
          <input id="historySearch" class="search premium-input v24-history-search" placeholder="Найти задачу, пример, уравнение или выражение" value="${state.historyQuery || ''}" />
          <div class="v24-history-search-note">Быстрый поиск по тексту задачи и объяснения</div>
        </div>
      </div>

      <div class="card answer-card premium-card history-archive-card skyline-scene-card skyline-scene-history-grid v24-history-grid-shell v27-history-grid-shell">
        ${items.length ? `
          <div class="list premium-list archive-grid skyline-archive-grid v24-archive-grid">
            ${items.map((item, index) => {
              const kind = detectKind(item.task);
              return `
                <div class="item item-history premium-item archive-item skyline-archive-item v24-archive-item v24-kind-${kind.toLowerCase()} v27-archive-item">
                  <div class="v27-archive-rails"></div>
                  <div class="v24-archive-top v27-archive-top">
                    <div class="v24-archive-emblem">${detectGlyph(kind)}</div>
                    <div>
                      <div class="v24-archive-kicker">${kind}</div>
                      <div class="v24-archive-line">${detectLine(kind)}</div>
                    </div>
                    <span class="item-badge item-badge-kind">Модуль ${String(index + 1).padStart(2, '0')}</span>
                  </div>

                  <div class="v24-archive-body">
                    <div class="item-title v24-archive-title">${item.task}</div>
                    <div class="muted small v24-archive-preview">${String(item.result).slice(0, 190)}${String(item.result).length > 190 ? '…' : ''}</div>
                  </div>

                  <div class="v24-archive-bottom v27-archive-bottom">
                    <div class="v24-archive-signal v27-archive-signal"><span></span><span></span><span></span></div>
                    <div class="v27-archive-tags"><span>${kind}</span><span>Skyline</span></div>
                    <button class="history-open-btn v24-history-open" data-history-open="${item.id}">Начать</button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        ` : `<div class="empty premium-empty skyline-empty v24-history-empty">Архив пока пустой. Решите первую задачу — и здесь появится первый световой модуль с объяснением.</div>`}
      </div>
    </section>
  `;
}
