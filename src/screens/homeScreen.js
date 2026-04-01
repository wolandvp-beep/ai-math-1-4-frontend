export function renderHomeScreen({ t, state }) {
  return `
    <section class="screen ${state.route === 'home' ? 'active' : ''}" data-screen="home">
      <div class="hero hero-main">
        <div class="hero-text">
          <h1>${t('app.name')}</h1>
          <p>Объясняет задачи, примеры и уравнения спокойно, ясно и без лишних слов.</p>
        </div>
        <div class="row" style="margin-top:16px;">
          <button class="primary" data-nav="solve">Открыть</button>
        </div>
      </div>

      <div class="card quick-card">
        <div class="quick-title">Что умеет приложение</div>
        <div class="quick-grid">
          <div class="mini-feature">
            <span class="mini-dot"></span>
            <div>
              <b>Понятное решение</b>
              <div class="muted small">Пошаговое объяснение и короткий ответ.</div>
            </div>
          </div>
          <div class="mini-feature">
            <span class="mini-dot"></span>
            <div>
              <b>История</b>
              <div class="muted small">Можно вернуться к прошлым задачам, примерам и уравнениям в один тап.</div>
            </div>
          </div>
          <div class="mini-feature">
            <span class="mini-dot"></span>
            <div>
              <b>Озвучка</b>
              <div class="muted small">Готовое объяснение можно слушать, ставить на паузу и останавливать.</div>
            </div>
          </div>
          <div class="mini-feature">
            <span class="mini-dot"></span>
            <div>
              <b>Профиль</b>
              <div class="muted small">Аккаунт, доступ и оплата находятся отдельно от главного экрана.</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}
