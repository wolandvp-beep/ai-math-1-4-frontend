export function renderAccountScreens({ state, session }) {
  const isAuth = session.authStatus === 'authenticated';
  const authStatusText = isAuth ? `Вы вошли как ${session.user?.name || 'пользователь'}.` : 'Сейчас открыт гостевой режим.';
  const accessCore = isAuth ? 'Secure Session' : 'Guest Session';

  return `
    <section class="screen ${state.route === 'account' ? 'active' : ''}" data-screen="account">
      <div class="card glass-card inner-hero-card">
        <div class="screen-hero-art account-hero-art" aria-hidden="true"></div>
        <div class="section-overline">Account Core</div>
        <h2 class="section-title premium-screen-title">Центр доступа</h2>
        <p class="section-sub premium-screen-sub">Вход, регистрация, восстановление и управление текущей сессией в одном защищённом модуле.</p>
        <div class="hero-status-row profile-status-grid">
          <div class="hero-status-pill"><span>Состояние</span><b>${isAuth ? 'Активно' : 'Гостевой вход'}</b></div>
          <div class="hero-status-pill"><span>Контур</span><b>${accessCore}</b></div>
        </div>
      </div>
      <div class="card glass-card info-panel-card">
        <div class="premium-stat"><span class="premium-stat-label">Сессия</span><b>${isAuth ? 'Авторизована' : 'Не авторизована'}</b></div>
        <div class="item premium-info-item"><div class="item-title">Текущее состояние</div><div class="muted small">${authStatusText}</div></div>
      </div>
      <div class="card answer-card action-list-card"><div class="list premium-action-list">
        <button class="item premium-action-item" data-nav="login"><div class="item-title">Войти</div><div class="muted small">Вход в аккаунт для синхронизации, истории и будущих подписок.</div></button>
        <button class="item premium-action-item" data-nav="register"><div class="item-title">Создать аккаунт</div><div class="muted small">Регистрация нового профиля пользователя и подключение сохранения данных.</div></button>
        <button class="item premium-action-item" data-nav="recovery"><div class="item-title">Восстановить доступ</div><div class="muted small">Экран восстановления доступа к аккаунту через email.</div></button>
        <div class="item premium-action-item passive-item"><div class="item-title">Гостевой режим</div><div class="muted small">Приложение пока можно использовать без реального входа.</div></div>
        <button class="item premium-action-item danger-item" data-stub-action="logout-submit"><div class="item-title">Выйти</div><div class="muted small">Демо-выход из аккаунта и возврат к локальному режиму.</div></button>
      </div></div>
    </section>

    <section class="screen ${state.route === 'login' ? 'active' : ''}" data-screen="login">
      <div class="card glass-card inner-hero-card compact-hero-card"><div class="screen-hero-art account-hero-art"></div><div class="section-overline">Sign In</div><h2 class="section-title premium-screen-title">Вход в систему</h2><p class="section-sub premium-screen-sub">Откройте синхронизацию профиля, историю и доступ к премиальным модулям.</p></div>
      <div class="card answer-card form-shell-card"><div class="grid premium-form-grid"><input id="loginEmail" class="search premium-search premium-field" placeholder="Email" /><input id="loginPassword" class="search premium-search premium-field" type="password" placeholder="Пароль" /><div id="loginErrors" class="muted small form-errors"></div><div class="row"><button class="primary primary-wide" data-stub-action="login-submit">Войти</button><button class="secondary" data-nav="recovery">Забыли пароль</button></div></div></div>
    </section>

    <section class="screen ${state.route === 'register' ? 'active' : ''}" data-screen="register">
      <div class="card glass-card inner-hero-card compact-hero-card"><div class="screen-hero-art editor-hero-art"></div><div class="section-overline">Create ID</div><h2 class="section-title premium-screen-title">Регистрация</h2><p class="section-sub premium-screen-sub">Создайте новый аккаунт и включите персональную историю решений.</p></div>
      <div class="card answer-card form-shell-card"><div class="grid premium-form-grid"><input id="registerName" class="search premium-search premium-field" placeholder="Имя родителя или пользователя" /><input id="registerEmail" class="search premium-search premium-field" placeholder="Email" /><input id="registerPassword" class="search premium-search premium-field" type="password" placeholder="Пароль" /><div id="registerErrors" class="muted small form-errors"></div><div class="row"><button class="primary primary-wide" data-stub-action="register-submit">Создать аккаунт</button><button class="secondary" data-nav="login">Уже есть аккаунт</button></div></div></div>
    </section>

    <section class="screen ${state.route === 'recovery' ? 'active' : ''}" data-screen="recovery">
      <div class="card glass-card inner-hero-card compact-hero-card"><div class="screen-hero-art subscription-hero-art"></div><div class="section-overline">Recovery Link</div><h2 class="section-title premium-screen-title">Восстановление доступа</h2><p class="section-sub premium-screen-sub">Укажите email, чтобы получить ссылку восстановления.</p></div>
      <div class="card answer-card form-shell-card"><div class="grid premium-form-grid"><input id="recoveryEmail" class="search premium-search premium-field" placeholder="Email" /><div id="recoveryErrors" class="muted small form-errors"></div><div class="row"><button class="primary primary-wide" data-stub-action="recovery-submit">Отправить ссылку</button><button class="secondary" data-nav="login">Назад ко входу</button></div></div></div>
    </section>`;
}
