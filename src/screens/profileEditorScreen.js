export function renderProfileEditorScreen({ state, profile }) {
  return `
    <section class="screen ${state.route === 'profileEditor' ? 'active' : ''}" data-screen="profileEditor">
      <div class="card">
        <h2 class="section-title">Редактирование профиля</h2>
        <div class="grid">
          <input id="profileName" class="search" placeholder="Имя" value="${profile.name || ''}" />
          <input id="profileChildName" class="search" placeholder="Имя ребёнка" value="${profile.childName || ''}" />
          <div id="profileEditorErrors" class="muted small" style="color:#dc2626;"></div>
          <div class="row">
            <button class="primary" data-stub-action="save-profile">Сохранить</button>
            <button class="secondary" data-nav="userProfile">Назад</button>
          </div>
        </div>
      </div>
    </section>
  `;
}
