export function renderAccountScreens({ state, session }) {
  const authStatusText = session.authStatus === 'authenticated'
    ? `Вы вошли как ${session.user?.name || 'пользователь'}.`
    : 'Сейчас открыт гостевой режим.';
  return `
    <section class="screen ${state.route === 'account' ? 'active' : ''}" data-screen="account">
      <div class="card glass-card premium-card skyline-scene-card skyline-scene-profile-grid v22-form-card v24-access-card">
        <div class="v24-access-head">
          <div>
            <div class="section-overline">Центр доступа</div>
            <h2 class="section-title">Аккаунт</h2>
            <p class="section-sub">Здесь собраны маршруты входа, регистрации и восстановления в едином футуристическом хабе.</p>
          </div>
          <div class="panel-badge">Access core</div>
        </div>
        <div class="item premium-item v22-status-item v24-access-status">
          <div class="item-title">Состояние сессии</div>
          <div class="muted small">${authStatusText}</div>
        </div>
        <div class="list v24-access-list">
          <button class="item premium-item v22-action-item v24-access-item" data-nav="login">
            <div class="v24-access-icon">◌</div>
            <div><div class="item-title">Войти</div><div class="muted small">Подключение к профилю для синхронизации и будущих подписок.</div></div>
          </button>
          <button class="item premium-item v22-action-item v24-access-item" data-nav="register">
            <div class="v24-access-icon">✦</div>
            <div><div class="item-title">Создать аккаунт</div><div class="muted small">Регистрация нового профиля семьи или пользователя.</div></div>
          </button>
          <button class="item premium-item v22-action-item v24-access-item" data-nav="recovery">
            <div class="v24-access-icon">◎</div>
            <div><div class="item-title">Восстановить доступ</div><div class="muted small">Маршрут для возврата доступа к аккаунту.</div></div>
          </button>
          <div class="item premium-item v22-action-item v24-access-item">
            <div class="v24-access-icon">◈</div>
            <div><div class="item-title">Гостевой режим</div><div class="muted small">Сейчас приложением можно пользоваться и без реального входа.</div></div>
          </div>
          <button class="item premium-item v22-action-item v24-access-item" data-stub-action="logout-submit">
            <div class="v24-access-icon">⌁</div>
            <div><div class="item-title">Выйти</div><div class="muted small">Демо-выход из текущей сессии.</div></div>
          </button>
        </div>
      </div>
    </section>

    <section class="screen ${state.route === 'login' ? 'active' : ''}" data-screen="login">
      <div class="card glass-card premium-card skyline-scene-card skyline-scene-solve v22-form-card v24-form-panel">
        <div class="v24-form-head">
          <div class="section-overline">Вход</div>
          <h2 class="section-title">Подключение к профилю</h2>
        </div>
        <div class="grid v24-form-grid">
          <input id="loginEmail" class="search premium-input" placeholder="Email" />
          <input id="loginPassword" class="search premium-input" type="password" placeholder="Пароль" />
          <div id="loginErrors" class="muted small v24-form-error"></div>
          <div class="row">
            <button class="primary" data-stub-action="login-submit">Войти</button>
            <button class="secondary" data-nav="recovery">Забыли пароль</button>
          </div>
        </div>
      </div>
    </section>

    <section class="screen ${state.route === 'register' ? 'active' : ''}" data-screen="register">
      <div class="card glass-card premium-card skyline-scene-card skyline-scene-profile-grid v22-form-card v24-form-panel">
        <div class="v24-form-head">
          <div class="section-overline">Регистрация</div>
          <h2 class="section-title">Создать новый профиль</h2>
        </div>
        <div class="grid v24-form-grid">
          <input id="registerName" class="search premium-input" placeholder="Имя родителя или пользователя" />
          <input id="registerEmail" class="search premium-input" placeholder="Email" />
          <input id="registerPassword" class="search premium-input" type="password" placeholder="Пароль" />
          <div id="registerErrors" class="muted small v24-form-error"></div>
          <div class="row">
            <button class="primary" data-stub-action="register-submit">Создать аккаунт</button>
            <button class="secondary" data-nav="login">Уже есть аккаунт</button>
          </div>
        </div>
      </div>
    </section>

    <section class="screen ${state.route === 'recovery' ? 'active' : ''}" data-screen="recovery">
      <div class="card glass-card premium-card skyline-scene-card skyline-scene-history-head v22-form-card v24-form-panel">
        <div class="v24-form-head">
          <div class="section-overline">Восстановление</div>
          <h2 class="section-title">Вернуть доступ</h2>
        </div>
        <div class="grid v24-form-grid">
          <input id="recoveryEmail" class="search premium-input" placeholder="Email" />
          <div id="recoveryErrors" class="muted small v24-form-error"></div>
          <div class="row">
            <button class="primary" data-stub-action="recovery-submit">Отправить ссылку</button>
            <button class="secondary" data-nav="login">Назад ко входу</button>
          </div>
        </div>
      </div>
    </section>
  `;
}
