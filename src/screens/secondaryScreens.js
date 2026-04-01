export function renderSecondaryScreens({ state }) {
  return `
    <section class="screen ${state.route === 'parents' ? 'active' : ''}" data-screen="parents">
      <div class="card">
        <h2 class="section-title">Родителям</h2>
        <div class="list">
          <div class="item"><div class="item-title">Спокойные объяснения</div><div class="muted small">Ребёнок получает понятный ход мысли без лишнего перегруза.</div></div>
          <div class="item"><div class="item-title">Будущий семейный доступ</div><div class="muted small">Позже здесь появятся семейные сценарии и управление доступом.</div></div>
        </div>
      </div>
    </section>
  `;
}
