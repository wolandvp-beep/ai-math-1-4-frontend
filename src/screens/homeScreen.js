export function renderHomeScreen({ state }) {
  return `
    <section class="screen ${state.route === 'home' ? 'active' : ''}" data-screen="home">
      <img class="hero-art" src="./src/assets/hero-home.png" alt="Неоновый город будущего">
      <div class="card holo">
        <h2 class="section-title">Математика — суперсила будущего</h2>
        <p class="section-sub">Решайка помогает разбирать задачи, примеры и уравнения спокойно, ясно и красиво.</p>
        <div class="row">
          <button class="primary cta-wide" data-nav="solve">Начать</button>
        </div>
      </div>
      <div class="module-grid">
        <button class="module" data-nav="solve">
          <div class="mini">⚡ Ввод</div>
          <div class="title">Новая задача</div>
          <div class="desc">Открой поле и напиши своё условие, пример или уравнение.</div>
        </button>
        <button class="module" data-nav="history">
          <div class="mini">🕘 История</div>
          <div class="title">Мои решения</div>
          <div class="desc">Возвращайся к прошлым объяснениям в один тап.</div>
        </button>
      </div>
    </section>
  `;
}
