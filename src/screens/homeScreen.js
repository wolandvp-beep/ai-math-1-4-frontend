export function renderHomeScreen({ t, state }) {
  return `
    <section class="screen ${state.route === 'home' ? 'active' : ''}" data-screen="home">
      <div class="hero hero-main">
        <h1>${t('app.name')}</h1>
        <div class="hero-art" aria-hidden="true"></div>
        <div class="row" style="margin-top:14px;">
          <button class="primary" data-nav="solve">Решить задачу</button>
        </div>
      </div>

      <div class="grid two">
        <button class="action" data-nav="solve">
          <div class="title">Новая задача</div>
          <div class="desc">Открывает чистый экран ввода и сразу ведёт к объяснению.</div>
        </button>
        <button class="action" data-nav="progress">
          <div class="title">Мой прогресс</div>
          <div class="desc">Здесь будут темы, пройденные навыки, серии дней, успехи и слабые места.</div>
        </button>
      </div>
    </section>
  `;
}
