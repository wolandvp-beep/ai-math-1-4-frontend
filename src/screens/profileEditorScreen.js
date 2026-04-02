export function renderProfileEditorScreen({ state, profile }) {
  return `
    <section class="screen ${state.route === 'profileEditor' ? 'active' : ''}" data-screen="profileEditor">
      <div class="card glass-card inner-hero-card"><div class="screen-hero-art editor-hero-art"></div><div class="section-overline">Edit Matrix</div><h2 class="section-title premium-screen-title">Редактирование профиля</h2><p class="section-sub premium-screen-sub">Обновите имя пользователя и профиль ребёнка в редакторе с мягкой sci-fi подачей.</p></div>
      <div class="card answer-card form-shell-card"><div class="grid premium-form-grid"><input id="profileName" class="search premium-search premium-field" placeholder="Имя" value="${profile.name || ''}" /><input id="profileChildName" class="search premium-search premium-field" placeholder="Имя ребёнка" value="${profile.childName || ''}" /><div id="profileEditorErrors" class="muted small form-errors"></div><div class="row"><button class="primary primary-wide" data-stub-action="save-profile">Сохранить</button><button class="secondary" data-nav="userProfile">Назад</button></div></div></div>
    </section>`;
}
