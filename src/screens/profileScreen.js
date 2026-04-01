export function renderProfileScreen({ t, state, session, subscription }) {
  const authLabel = session.authStatus === 'authenticated' ? 'Выполнен вход' : 'Гостевой режим';
  const subLabel = subscription.status === 'active' ? 'Активна' : 'Не подключена';

  return `
    <section class="screen ${state.route === 'profile' ? 'active' : ''}" data-screen="profile">
      <div class="hero hero-profile hero-premium skyline-profile-hero v24-profile-hero">
        <div class="hero-grid hero-grid-single v24-profile-hero-grid">
          <div class="hero-text premium-copy v24-profile-copy">
            <div class="hero-chip">Skyline command hub</div>
            <h1>Профиль</h1>
            <p>Панель доступа и настроек внутри того же художественного bright cyber мира: стеклянные отсеки, световые маршруты, мягкое свечение и понятная структура для семьи.</p>
          </div>
        </div>
        <div class="hero-status-row v24-profile-status-row">
          <div class="hero-status-pill"><span>Аккаунт</span><b>${authLabel}</b></div>
          <div class="hero-status-pill"><span>Подписка</span><b>${subLabel}</b></div>
          <div class="hero-status-pill"><span>Контур</span><b>Family skyline grid</b></div>
        </div>
      </div>

      <div class="card glass-card premium-card profile-grid-card skyline-scene-card skyline-scene-profile-grid v24-profile-deck">
        <div class="v24-profile-deck-head">
          <div>
            <div class="section-overline">Командный отсек</div>
            <h2 class="section-title">Управление доступом и настройками</h2>
          </div>
          <div class="panel-badge">Premium control deck</div>
        </div>

        <div class="v24-profile-grid">
          <button class="setting v24-setting-card v24-setting-account" data-nav="account">
            <span class="v24-setting-main"><span class="inline-icon inline-icon-cyan">◌</span><span><b>${t('profile.account')}</b><small>Вход, регистрация и восстановление доступа</small></span></span>
            <span class="v24-setting-tail">›</span>
          </button>
          <button class="setting v24-setting-card v24-setting-user" data-nav="userProfile">
            <span class="v24-setting-main"><span class="inline-icon inline-icon-violet">◎</span><span><b>Профиль пользователя</b><small>Имя, email, ребёнок и синхронизация</small></span></span>
            <span class="v24-setting-tail">›</span>
          </button>
          <button class="setting v24-setting-card v24-setting-sub" data-nav="subscription">
            <span class="v24-setting-main"><span class="inline-icon inline-icon-gold">✦</span><span><b>${t('profile.subscription')}</b><small>Планы, оплата и будущие доступы</small></span></span>
            <span class="v24-setting-tail">›</span>
          </button>
          <button class="setting v24-setting-card" data-open-stub="language">
            <span class="v24-setting-main"><span class="inline-icon inline-icon-pink">⌘</span><span><b>${t('profile.language')}</b><small>Сейчас интерфейс работает на русском</small></span></span>
            <span class="v24-setting-tail">ru</span>
          </button>
          <button class="setting v24-setting-card" data-open-stub="notifications">
            <span class="v24-setting-main"><span class="inline-icon inline-icon-cyan">◈</span><span><b>${t('profile.notifications')}</b><small>Напоминания и будущие обучающие сигналы</small></span></span>
            <span class="v24-setting-tail">›</span>
          </button>
          <button class="setting v24-setting-card" data-nav="parents">
            <span class="v24-setting-main"><span class="inline-icon inline-icon-violet">◐</span><span><b>${t('profile.family')}</b><small>Семейный доступ и родительский раздел</small></span></span>
            <span class="v24-setting-tail">›</span>
          </button>
          <button class="setting v24-setting-card" data-open-stub="privacy">
            <span class="v24-setting-main"><span class="inline-icon inline-icon-gold">⬢</span><span><b>${t('profile.privacy')}</b><small>Конфиденциальность и безопасность данных</small></span></span>
            <span class="v24-setting-tail">›</span>
          </button>
        </div>
      </div>
    </section>
  `;
}
