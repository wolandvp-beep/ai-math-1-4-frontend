export function renderHomeScreen({ t, state }) {
  const total = state.history.length;
  const favorites = state.favorites.length;

  return `
    <section class="screen ${state.route === 'home' ? 'active' : ''}" data-screen="home">
      <div class="hero">
        <div class="badge">🌟 Решайка нового уровня</div>
        <h1>${t('app.name')}</h1>
        <p>Не просто решает. Помогает понять задачу легко, ярко и без скуки.</p>
        <div class="row" style="margin-top:16px;">
          <button class="primary" data-nav="solve">Начать решать</button>
          <button class="ghost" data-nav="history">Посмотреть решения</button>
        </div>
        <div class="hero-stats">
          <div class="hero-stat"><span class="small">Решений</span><b>${total}</b></div>
          <div class="hero-stat"><span class="small">Избранных</span><b>${favorites}</b></div>
        </div>
      </div>

      <div class="highlight-card">
        <h3>Понятно. Красиво. Спокойно.</h3>
        <div>У ребёнка не должно быть ощущения серого учебника. Здесь всё должно звать решать дальше.</div>
      </div>

      <div class="grid two">
        <button class="action" data-nav="solve">
          <div class="title">Решить задачу</div>
          <div class="desc">Напишите условие и сразу получите ясное объяснение с ответом.</div>
        </button>
        <button class="action" data-nav="history">
          <div class="title">История решений</div>
          <div class="desc">Сохраняйте хорошие объяснения и возвращайтесь к ним позже.</div>
        </button>
        <button class="action" data-nav="progress">
          <div class="title">Мой прогресс</div>
          <div class="desc">Позже здесь появятся темы, навыки и визуальный рост ребёнка.</div>
        </button>
        <button class="action" data-nav="subscription">
          <div class="title">Доступ и оплата</div>
          <div class="desc">Подготовленный путь для аккаунта, доступа и будущей монетизации.</div>
        </button>
      </div>
    </section>
  `;
}
