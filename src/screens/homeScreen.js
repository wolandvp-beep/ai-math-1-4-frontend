export function renderHomeScreen({ t, state }) {
  const total = state.history.length;
  const favorites = state.favorites.length;

  return `
    <section class="screen ${state.route === 'home' ? 'active' : ''}" data-screen="home">
      <div class="hero">
        <div class="badge">✨ Яркая версия Решайки</div>
        <h1>${t('app.name')}</h1>
        <p>Показывает ход мысли просто, по шагам и без скучной школьной подачи.</p>
        <div class="row" style="margin-top:16px;">
          <button class="primary" data-nav="solve">Начать</button>
          <button class="ghost" data-nav="history">Мои решения</button>
        </div>
        <div class="hero-stats">
          <div class="hero-stat"><span class="small">Решений</span><b>${total}</b></div>
          <div class="hero-stat"><span class="small">Избранных</span><b>${favorites}</b></div>
        </div>
      </div>

      <div class="highlight-card">
        <h3>Учиться должно быть приятно</h3>
        <div>Яркие карточки, крупные кнопки и понятные шаги — чтобы ребёнку было интересно возвращаться в приложение.</div>
      </div>

      <div class="grid two">
        <button class="action" data-nav="solve">
          <div class="title">Решить задачу</div>
          <div class="desc">Вводите условие и сразу получайте спокойное объяснение и ответ.</div>
        </button>
        <button class="action" data-nav="history">
          <div class="title">История</div>
          <div class="desc">Открывайте прошлые объяснения и возвращайтесь к ним в один тап.</div>
        </button>
        <button class="action" data-nav="progress">
          <div class="title">Прогресс</div>
          <div class="desc">Пока как витрина. Позже здесь будут темы, рост и достижения.</div>
        </button>
        <button class="action" data-nav="subscription">
          <div class="title">Доступ</div>
          <div class="desc">Экран подписки и оплаты уже подготовлен под будущую монетизацию.</div>
        </button>
      </div>
    </section>
  `;
}
