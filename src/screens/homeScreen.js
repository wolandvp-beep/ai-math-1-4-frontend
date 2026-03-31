export function renderHomeScreen({ t, state }) {
  const total = state.history.length;
  const favorites = state.favorites.length;

  return `
    <section class="screen ${state.route === 'home' ? 'active' : ''}" data-screen="home">
      <div class="hero">
        <div class="badge">${t('hero.badge')}</div>
        <h1>${t('app.name')}</h1>
        <p>${t('app.tagline')}</p>
        <div class="row" style="margin-top:16px;">
          <button class="primary" data-nav="solve">${t('hero.cta.solve')}</button>
          <button class="secondary" data-nav="history">${t('hero.cta.history')}</button>
        </div>
      </div>

      <div class="grid two">
        <div class="kpi"><div class="muted small">Решений</div><div class="n">${total}</div></div>
        <div class="kpi"><div class="muted small">Избранных</div><div class="n">${favorites}</div></div>
      </div>

      <div class="grid two">
        <button class="action" data-nav="solve">
          <div class="title">${t('home.actions.solve.title')}</div>
          <div class="desc">${t('home.actions.solve.desc')}</div>
        </button>
        <button class="action" data-nav="progress">
          <div class="title">${t('home.actions.progress.title')}</div>
          <div class="desc">${t('home.actions.progress.desc')}</div>
        </button>
        <button class="action" data-nav="parents">
          <div class="title">${t('home.actions.parents.title')}</div>
          <div class="desc">${t('home.actions.parents.desc')}</div>
        </button>
        <button class="action" data-nav="subscription">
          <div class="title">${t('home.actions.subscription.title')}</div>
          <div class="desc">${t('home.actions.subscription.desc')}</div>
        </button>
      </div>
    </section>
  `;
}
