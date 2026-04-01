
export function renderHomeScreen({ state }) {
  return `
    <section class="screen ${state.route === 'home' ? 'active' : ''}" data-screen="home">
      <div class="hero hero-main">
        <div class="hero-content">
          <div class="hero-kicker">⚡ Математика как суперсила</div>
          <h1>Решайка</h1>
          <p>Объясняет задачи, примеры, уравнения и выражения спокойно, ясно и без лишних слов.</p>
        </div>
        <div class="row" style="margin-top:16px;">
          <button class="primary-btn" data-nav="solve">Начать</button>
        </div>
      </div>

      <div class="card">
        <div class="section-overline">Что можно вводить</div>
        <div class="quick-grid">
          <div class="mini-feature">
            <span class="mini-dot"></span>
            <div><b>Задача</b><div class="muted small">Текстовое условие с объяснением хода мысли и ответа.</div></div>
          </div>
          <div class="mini-feature">
            <span class="mini-dot"></span>
            <div><b>Пример</b><div class="muted small">Сложение, вычитание, умножение и деление.</div></div>
          </div>
          <div class="mini-feature">
            <span class="mini-dot"></span>
            <div><b>Уравнение</b><div class="muted small">Простые уравнения с понятным разбором.</div></div>
          </div>
          <div class="mini-feature">
            <span class="mini-dot"></span>
            <div><b>Выражение</b><div class="muted small">Несколько действий подряд с пояснением.</div></div>
          </div>
        </div>
      </div>
    </section>
  `;
}
