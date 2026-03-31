export function renderSecondaryScreens({ t, state }) {
  return `
    <section class="screen ${state.route === 'progress' ? 'active' : ''}" data-screen="progress">
      <div class="card">
        <h2 class="section-title">${t('progress.title')}</h2>
        <div class="empty">${t('progress.stub')}</div>
      </div>
    </section>

    <section class="screen ${state.route === 'parents' ? 'active' : ''}" data-screen="parents">
      <div class="card">
        <h2 class="section-title">Родителям</h2>
        <div class="list">
          <div class="item"><div class="item-title">Спокойный формат объяснений</div><div class="muted small">Ребёнок получает понятный ход мысли без перегруза.</div></div>
          <div class="item"><div class="item-title">Подготовка к семейному доступу</div><div class="muted small">Позже здесь появятся аккаунты, роли родителей и история ребёнка.</div></div>
          <div class="item"><div class="item-title">Основа для мультиязычности</div><div class="muted small">Русская версия фиксируется первой, затем подключаются переводы.</div></div>
        </div>
      </div>
    </section>
  `;
}
