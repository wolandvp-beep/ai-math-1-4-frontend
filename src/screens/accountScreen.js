export function renderAccountScreens({ state, session }) {
  const authStatusText = session.authStatus === 'authenticated'
    ? `Вы вошли как ${session.user?.name || 'пользователь'}.`
    : 'Сейчас открыт гостевой режим.';
  return `
    <section class="screen ${state.route === 'account' ? 'active' : ''}" data-screen="account">
      <div class="card">
        <h2 class="section-title">Аккаунт</h2>
        <div class="item" style="margin-bottom:12px;">
          <div class="item-title">Состояние сессии</div>
          <div class="muted small">${authStatusText}</div>
        </div>
        <div class="list">
          <button class="item" data-nav="login">
            <div class="item-title">Войти</div>
            <div class="muted small">Вход в аккаунт для синхронизации и будущих подписок.</div>
          </button>
          <button class="item" data-nav="register">
            <div class="item-title">Создать аккаунт</div>
            <div class="muted small">Регистрация нового профиля пользователя.</div>
          </button>
          <button class="item" data-nav="recovery">
            <div class="item-title">Восстановить доступ</div>
            <div class="muted small">Экран восстановления доступа к аккаунту.</div>
          </button>
          <div class="item">
            <div class="item-title">Гостевой режим</div>
            <div class="muted small">Пока приложение может использоваться без реального входа.</div>
          </div>
          <button class="item" data-stub-action="logout-submit">
            <div class="item-title">Выйти</div>
            <div class="muted small">Демо-выход из аккаунта.</div>
          </button>
        </div>
      </div>
    </section>

    <section class="screen ${state.route === 'login' ? 'active' : ''}" data-screen="login">
      <div class="card">
        <h2 class="section-title">Вход</h2>
        <div class="grid">
          <input id="loginEmail" class="search" placeholder="Email" />
          <input id="loginPassword" class="search" type="password" placeholder="Пароль" />
          <div id="loginErrors" class="muted small" style="color:#dc2626;"></div>
          <div class="row">
            <button class="primary" data-stub-action="login-submit">Войти</button>
            <button class="secondary" data-nav="recovery">Забыли пароль</button>
          </div>
        </div>
      </div>
    </section>

    <section class="screen ${state.route === 'register' ? 'active' : ''}" data-screen="register">
      <div class="card">
        <h2 class="section-title">Регистрация</h2>
        <div class="grid">
          <input id="registerName" class="search" placeholder="Имя родителя или пользователя" />
          <input id="registerEmail" class="search" placeholder="Email" />
          <input id="registerPassword" class="search" type="password" placeholder="Пароль" />
          <div id="registerErrors" class="muted small" style="color:#dc2626;"></div>
          <div class="row">
            <button class="primary" data-stub-action="register-submit">Создать аккаунт</button>
            <button class="secondary" data-nav="login">Уже есть аккаунт</button>
          </div>
        </div>
      </div>
    </section>

    <section class="screen ${state.route === 'recovery' ? 'active' : ''}" data-screen="recovery">
      <div class="card">
        <h2 class="section-title">Восстановление доступа</h2>
        <div class="grid">
          <input id="recoveryEmail" class="search" placeholder="Email" />
          <div id="recoveryErrors" class="muted small" style="color:#dc2626;"></div>
          <div class="row">
            <button class="primary" data-stub-action="recovery-submit">Отправить ссылку</button>
            <button class="secondary" data-nav="login">Назад ко входу</button>
          </div>
        </div>
      </div>
    </section>
  `;
}
