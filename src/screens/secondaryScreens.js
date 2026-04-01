export function renderSecondaryScreens({ state }) {
  return `
    <section class="screen ${state.route === 'progress' ? 'active' : ''}" data-screen="progress">
      <div class="card glass-card premium-card skyline-scene-card skyline-scene-history-grid v22-form-card">
        <div class="section-overline">Скрытый модуль</div>
        <h2 class="section-title">Раздел пока не используется</h2>
        <div class="empty skyline-empty">Этот модуль ещё не подключён к сценарию приложения.</div>
      </div>
    </section>

    <section class="screen ${state.route === 'parents' ? 'active' : ''}" data-screen="parents">
      <div class="card glass-card premium-card skyline-scene-card skyline-scene-profile-grid v22-form-card">
        <div class="section-overline">Для родителей</div>
        <h2 class="section-title">Как устроена Решайка</h2>
        <div class="list">
          <div class="item premium-item v22-action-item"><div class="item-title">Спокойная подача</div><div class="muted small">Решайка объясняет задачу без перегруза и лишних слов.</div></div>
          <div class="item premium-item v22-action-item"><div class="item-title">История задач</div><div class="muted small">Можно открыть прошлые объяснения и вернуться к ним позже.</div></div>
          <div class="item premium-item v22-action-item"><div class="item-title">Доступ и аккаунт</div><div class="muted small">Все настройки и будущая оплата находятся отдельно в профиле.</div></div>
        </div>
      </div>
    </section>
  `;
}
