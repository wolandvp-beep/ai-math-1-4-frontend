export function renderHomeScreen({ t, state }) {
  return `
    <section class="screen ${state.route === 'home' ? 'active' : ''}" data-screen="home">
      <div class="hero hero-main">
        <div class="hero-orbit hero-orbit-a"></div>
        <div class="hero-orbit hero-orbit-b"></div>
        <div class="hero-text">
          <div class="hero-kicker">НЕОНОВЫЙ МАТГОРОД</div>
          <h1>${t('app.name')}</h1>
          <p>Объясняет задачи, примеры и уравнения спокойно, ясно и так, будто математика — это суперсила будущего.</p>
        </div>
        <div class="row" style="margin-top:16px;">
          <button class="primary hero-start-btn" data-nav="solve">Начать</button>
        </div>
      </div>

      <div class="card quick-card">
        <div class="quick-title">Что умеет приложение</div>
        <div class="quick-grid">
          <div class="mini-feature">
            <span class="mini-dot"></span>
            <div>
              <b>Понятное решение</b>
              <div class="muted small">Пошаговое объяснение, красивый ответ и ощущение интерактивной голограммы.</div>
            </div>
          </div>
          <div class="mini-feature">
            <span class="mini-dot"></span>
            <div>
              <b>Примеры для старта</b>
              <div class="muted small">Ввод сразу показывает, что сюда можно писать задачу, пример, уравнение или короткий вопрос.</div>
            </div>
          </div>
          <div class="mini-feature">
            <span class="mini-dot"></span>
            <div>
              <b>Озвучка</b>
              <div class="muted small">Результат можно слушать, ставить на паузу и останавливать через иконки управления.</div>
            </div>
          </div>
          <div class="mini-feature">
            <span class="mini-dot"></span>
            <div>
              <b>История</b>
              <div class="muted small">Можно быстро вернуться к прошлым задачам и заново открыть решение.</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}
