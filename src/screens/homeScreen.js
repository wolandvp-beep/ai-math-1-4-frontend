export function renderHomeScreen({ state }) {
  const recent = (state.history || []).slice(0, 2);

  return `
    <section class="screen ${state.route === 'home' ? 'active' : ''}" data-screen="home">
      <div class="card glass-card home-hero-card">
        <div class="screen-hero-art home-hero-art" aria-hidden="true"></div>
        <div class="section-overline">Reshayka Core</div>
        <h1 class="section-title premium-screen-title">Математика как суперсила</h1>
        <p class="section-sub premium-screen-sub">Парадная сцена приложения: быстрый старт, последние задачи и вход в основные сценарии в одном неоновом модуле.</p>
        <div class="hero-status-row profile-status-grid">
          <div class="hero-status-pill"><span>Сценарий</span><b>Новая задача</b></div>
          <div class="hero-status-pill"><span>Контур</span><b>Future City UI</b></div>
        </div>
        <div class="row solve-actions-row">
          <button class="primary primary-wide" data-nav="solve">Новая задача</button>
          <button class="secondary secondary-wide" data-nav="history">Открыть историю</button>
        </div>
      </div>

      <div class="grid home-feature-grid two-info-grid">
        <button class="card answer-card home-feature-card" data-nav="solve" type="button">
          <div class="home-feature-kicker">Быстрый старт</div>
          <div class="item-title">Решить задачу</div>
          <div class="muted small">Перейти к вводу условия и получить понятное объяснение.</div>
        </button>
        <button class="card answer-card home-feature-card" data-nav="profile" type="button">
          <div class="home-feature-kicker">Контур доступа</div>
          <div class="item-title">Профиль и подписка</div>
          <div class="muted small">Управление аккаунтом, тарифом и настройками.</div>
        </button>
      </div>

      <div class="card glass-card home-quick-card">
        <div class="section-overline">Витрина возможностей</div>
        <div class="grid home-capability-grid">
          <div class="home-capability-item"><span class="home-capability-dot"></span><div><b>Пошаговое объяснение</b><div class="muted small">Решение без лишних слов и с понятным методом.</div></div></div>
          <div class="home-capability-item"><span class="home-capability-dot"></span><div><b>Озвучка ответа</b><div class="muted small">Готовое объяснение можно прослушать прямо в приложении.</div></div></div>
          <div class="home-capability-item"><span class="home-capability-dot"></span><div><b>История решений</b><div class="muted small">Быстрый возврат к уже решённым задачам и поиску по ним.</div></div></div>
          <div class="home-capability-item"><span class="home-capability-dot"></span><div><b>Премиальный кабинет</b><div class="muted small">Единый sci-fi поток от профиля до оплаты.</div></div></div>
        </div>
      </div>

      <div class="card answer-card home-recent-card">
        <div class="history-card-topline">
          <div class="item-title">Недавняя история</div>
          <button class="secondary compact-secondary" data-nav="history" type="button">Смотреть всё</button>
        </div>
        ${recent.length ? `<div class="list">${recent.map(item => `
          <button class="item item-history item-history-card premium-history-card" type="button" data-history-open="${item.id}">
            <div class="history-card-topline">
              <div class="item-history-meta">${new Date(item.createdAt).toLocaleString('ru-RU', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' })}</div>
              <div class="history-chip">Архив</div>
            </div>
            <div class="item-title">${item.task}</div>
            <div class="muted small">${String(item.result).slice(0, 120)}${String(item.result).length > 120 ? '…' : ''}</div>
          </button>`).join('')}</div>` : `
          <div class="premium-empty-state">
            <div class="state-icon state-empty" aria-hidden="true"></div>
            <div><div class="item-title">Пока нет сохранённых задач</div><div class="muted small">Перейдите в экран решения и создайте первую запись. Потом она появится здесь.</div></div>
          </div>`}
      </div>
    </section>
  `;
}
