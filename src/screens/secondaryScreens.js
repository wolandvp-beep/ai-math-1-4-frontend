export function renderSecondaryScreens({ state }) {
  return `
    <section class="screen ${state.route === 'progress' ? 'active' : ''}" data-screen="progress">
      <div class="card glass-card">
        <h2 class="section-title">Раздел скрыт</h2>
        <div class="premium-empty-state"><div class="state-icon state-empty"></div><div><div class="item-title">Этот раздел пока не используется</div><div class="muted small">Позже здесь можно разместить прогресс, достижения и детальную статистику.</div></div></div>
      </div>
    </section>

    <section class="screen ${state.route === 'parents' ? 'active' : ''}" data-screen="parents">
      <div class="card glass-card inner-hero-card compact-hero-card"><div class="screen-hero-art subscription-hero-art"></div><div class="section-overline">Родителям</div><h2 class="section-title premium-screen-title">О приложении для семьи</h2><p class="section-sub premium-screen-sub">Спокойная подача, история задач и будущий семейный доступ в одном маршруте.</p></div>
      <div class="card answer-card action-list-card"><div class="list premium-action-list"><div class="item premium-action-item"><div class="item-title">Спокойная подача</div><div class="muted small">Решайка объясняет задачу без перегруза и лишних слов.</div></div><div class="item premium-action-item"><div class="item-title">История задач</div><div class="muted small">Можно открыть прошлые объяснения и вернуться к ним позже.</div></div><div class="item premium-action-item"><div class="item-title">Доступ и аккаунт</div><div class="muted small">Все настройки и будущая оплата находятся отдельно в профиле.</div></div></div></div>
    </section>`;
}
