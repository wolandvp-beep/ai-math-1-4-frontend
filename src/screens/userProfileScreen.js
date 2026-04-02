export function renderUserProfileScreen({ state, profile }) {
  return `
    <section class="screen ${state.route === 'userProfile' ? 'active' : ''}" data-screen="userProfile">
      <div class="card">
        <h2 class="section-title">Профиль пользователя</h2>
        <div class="list">
          <div class="item">
            <div class="item-title">Имя</div>
            <div class="muted small">${profile.name || 'Пока не заполнено'}</div>
          </div>
          <div class="item">
            <div class="item-title">Email</div>
            <div class="muted small">${profile.email || 'Пока не заполнено'}</div>
          </div>
          <div class="item">
            <div class="item-title">Имя ребёнка</div>
            <div class="muted small">${profile.childName || 'Пока не заполнено'}</div>
          </div>
          <div class="item">
            <div class="item-title">Синхронизация</div>
            <div class="muted small">${profile.serverSynced ? 'Есть серверные данные' : 'Пока только локальные данные'}</div>
          </div>
        </div>
        <div class="row" style="margin-top:12px;">
          <button class="primary" data-stub-action="sync-profile">Синхронизировать профиль</button>
          <button class="secondary" data-nav="profileEditor">Редактировать</button>
          <button class="secondary" data-nav="profile">Назад</button>
        </div>
      </div>
    </section>
  `;
}
