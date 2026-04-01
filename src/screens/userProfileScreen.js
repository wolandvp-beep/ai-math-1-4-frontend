export function renderUserProfileScreen({ state, profile }) {
  return `
    <section class="screen ${state.route === 'userProfile' ? 'active' : ''}" data-screen="userProfile">
      <div class="card glass-card premium-card skyline-scene-card skyline-scene-profile-grid v24-access-card">
        <div class="v24-access-head">
          <div>
            <div class="section-overline">Паспорт профиля</div>
            <h2 class="section-title">Профиль пользователя</h2>
          </div>
          <div class="panel-badge">Profile beam</div>
        </div>
        <div class="list v24-profile-detail-list">
          <div class="item premium-item v24-access-item"><div class="v24-access-icon">◌</div><div><div class="item-title">Имя</div><div class="muted small">${profile.name || 'Пока не заполнено'}</div></div></div>
          <div class="item premium-item v24-access-item"><div class="v24-access-icon">✦</div><div><div class="item-title">Email</div><div class="muted small">${profile.email || 'Пока не заполнено'}</div></div></div>
          <div class="item premium-item v24-access-item"><div class="v24-access-icon">◎</div><div><div class="item-title">Имя ребёнка</div><div class="muted small">${profile.childName || 'Пока не заполнено'}</div></div></div>
          <div class="item premium-item v24-access-item"><div class="v24-access-icon">◈</div><div><div class="item-title">Синхронизация</div><div class="muted small">${profile.serverSynced ? 'Есть серверные данные' : 'Пока только локальные данные'}</div></div></div>
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
