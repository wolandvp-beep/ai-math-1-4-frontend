import { escapeHtml, getTaskTypeLabel, truncateText } from '../utils/text.js';

export function renderHomeScreen({ t, state }) {
  const recent = (state.history || []).slice(0, 2);
  const examples = [
    ['Текстовая задача', 'У Маши было 9 конфет. 4 она съела. Сколько осталось?'],
    ['Уравнение', 'x + 14 = 20'],
    ['Геометрия', 'Найди площадь прямоугольника со сторонами 6 см и 4 см']
  ];

  return `
    <section class="screen ${state.route === 'home' ? 'active' : ''}" data-screen="home">
      <div class="hero hero-main raster-card raster-card-home">
        <div class="hero-text">
          <div class="section-overline home-overline">${escapeHtml(t('app.name'))}</div>
          <h1>Спокойное решение школьных задач</h1>
          <p>Открывайте задачу, получайте понятное объяснение и возвращайтесь к истории без лишних шагов.</p>
        </div>
        <div class="hero-status-row">
          <div class="hero-status-pill">
            <span>Главный экран</span>
            <b>Быстрый старт</b>
          </div>
          <div class="hero-status-pill">
            <span>Фокус</span>
            <b>Объяснение для ребёнка</b>
          </div>
        </div>
        <div class="row" style="margin-top:16px;">
          <button class="primary" data-nav="solve">Новая задача</button>
          <button class="secondary" data-nav="history">История</button>
        </div>
      </div>

      <div class="card quick-card raster-card">
        <div class="quick-title">Быстрый старт</div>
        <div class="start-grid">
          ${examples.map(([label, text]) => `
            <button class="start-tile" type="button" data-example-fill="${escapeHtml(text)}">
              <span class="start-tile-label">${escapeHtml(label)}</span>
              <span class="start-tile-text">${escapeHtml(text)}</span>
            </button>
          `).join('')}
        </div>
      </div>

      <div class="card glass-card raster-card">
        <div class="quick-title">Последние объяснения</div>
        ${recent.length ? `
          <div class="quick-grid">
            ${recent.map(item => `
              <button class="item item-history item-history-card" type="button" data-history-open="${item.id}">
                <div class="history-card-top">
                  <span class="history-badge">${escapeHtml(getTaskTypeLabel(item.task || ''))}</span>
                  <span class="item-history-meta">${escapeHtml(truncateText(new Date(item.createdAt).toLocaleString('ru-RU'), 20))}</span>
                </div>
                <div class="item-title">${escapeHtml(truncateText(item.task || '', 96))}</div>
                <div class="muted small">${escapeHtml(truncateText(item.result || '', 120))}</div>
              </button>
            `).join('')}
          </div>
        ` : `<div class="empty">Решите первую задачу, и здесь появятся последние объяснения.</div>`}
      </div>
    </section>
  `;
}
