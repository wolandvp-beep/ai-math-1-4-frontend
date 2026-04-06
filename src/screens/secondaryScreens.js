export function renderSecondaryScreens({ state }) {
  return `
    <section class="screen ${state.route === 'progress' ? 'active' : ''}" data-screen="progress">
      <div class="card glass-card">
        <h2 class="section-title">Раздел скрыт</h2>
        <div class="empty">Этот раздел сейчас не используется в приложении.</div>
      </div>
    </section>

    <section class="screen ${state.route === 'parents' ? 'active' : ''}" data-screen="parents">
      <div class="card glass-card">
        <div class="section-overline">Родителям</div>
        <h2 class="section-title">О приложении для семьи</h2>
        <div class="list">
          <div class="item"><div class="item-title">Спокойная подача</div><div class="muted small">Решайка объясняет задачу без перегруза и лишних слов.</div></div>
          <div class="item"><div class="item-title">История задач</div><div class="muted small">Можно открыть прошлые объяснения и вернуться к ним позже.</div></div>
          <div class="item"><div class="item-title">Доступ и аккаунт</div><div class="muted small">Все настройки и будущая оплата находятся отдельно в профиле.</div></div>
        </div>
      </div>
    </section>
  `;
}
