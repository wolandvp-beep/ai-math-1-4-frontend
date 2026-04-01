export function renderSecondaryScreens({ t, state }) {
  return `
    <section class="screen ${state.route === 'progress' ? 'active' : ''}" data-screen="progress">
      <div class="hero hero-progress">
        <h1 style="font-size:2rem;">Прогресс</h1>
        <div class="hero-art small" aria-hidden="true"></div>
      </div>

      <div class="card panel">
        <h2 class="section-title">${t('progress.title')}</h2>
        <div class="list">
          <div class="item"><div class="item-title">Темы</div><div class="muted small">Какие темы ребёнок уже проходил и какие даются легче всего.</div></div>
          <div class="item"><div class="item-title">Серии дней</div><div class="muted small">Сколько дней подряд ребёнок занимается без пропусков.</div></div>
          <div class="item"><div class="item-title">Точность</div><div class="muted small">Какие типы задач чаще всего понятны сразу, а где нужно больше практики.</div></div>
          <div class="item"><div class="item-title">Награды</div><div class="muted small">Визуальные достижения за регулярные занятия и освоенные навыки.</div></div>
        </div>
      </div>
    </section>

    <section class="screen ${state.route === 'parents' ? 'active' : ''}" data-screen="parents">
      <div class="card panel">
        <h2 class="section-title">Родителям</h2>
        <div class="list">
          <div class="item"><div class="item-title">Что будет дальше</div><div class="muted small">Позже здесь появятся семейный доступ, связь аккаунтов и история ребёнка.</div></div>
          <div class="item"><div class="item-title">Как мы объясняем</div><div class="muted small">Спокойно, пошагово и без лишней перегрузки текста.</div></div>
        </div>
      </div>
    </section>
  `;
}
