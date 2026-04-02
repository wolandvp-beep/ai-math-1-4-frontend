export function renderProfileScreen({ t, state, session, subscription }) {
  const authLabel = session.authStatus === 'authenticated' ? 'Выполнен вход' : 'Гостевой режим';
  const subLabel = subscription.status === 'active' ? 'Активна' : 'Не подключена';

  return `
    <section class="screen ${state.route === 'profile' ? 'active' : ''}" data-screen="profile">
      <div class="card glass-card profile-hero-card">
        <div class="screen-hero-art profile-hero-art" aria-hidden="true"></div>
        <div class="section-overline">Профиль</div>
        <h2 class="section-title premium-screen-title">Центр аккаунта</h2>
        <p class="section-sub premium-screen-sub">Аккаунт, доступ, статус подписки и персональные настройки в едином футуристическом модуле.</p>
        <div class="hero-status-row profile-status-grid">
          <div class="hero-status-pill"><span>Аккаунт</span><b>${authLabel}</b></div>
          <div class="hero-status-pill"><span>Доступ</span><b>${subLabel}</b></div>
        </div>
      </div>

      <div class="card glass-card stat-strip">
        <div class="premium-stat"><span class="premium-stat-label">Сессия</span><b>${session.authStatus === 'authenticated' ? 'Secure ID' : 'Guest ID'}</b></div>
        <div class="premium-stat"><span class="premium-stat-label">Режим</span><b>${subscription.status === 'active' ? 'Premium' : 'Basic'}</b></div>
      </div>

      <div class="card answer-card settings-panel">
        <button class="setting premium-setting" data-nav="account"><span><span class="inline-icon icon-account"></span>${t('profile.account')}</span><span>›</span></button>
        <button class="setting premium-setting" data-nav="userProfile"><span><span class="inline-icon icon-user"></span>Профиль пользователя</span><span>›</span></button>
        <button class="setting premium-setting" data-nav="subscription"><span><span class="inline-icon icon-subscription"></span>${t('profile.subscription')}</span><span>›</span></button>
        <button class="setting premium-setting" data-open-stub="language"><span><span class="inline-icon icon-language"></span>${t('profile.language')}</span><span>ru</span></button>
        <button class="setting premium-setting" data-open-stub="notifications"><span><span class="inline-icon icon-notifications"></span>${t('profile.notifications')}</span><span>›</span></button>
        <button class="setting premium-setting" data-nav="parents"><span><span class="inline-icon icon-family"></span>${t('profile.family')}</span><span>›</span></button>
        <button class="setting premium-setting" data-open-stub="privacy"><span><span class="inline-icon icon-privacy"></span>${t('profile.privacy')}</span><span>›</span></button>
      </div>
    </section>
  `;
}
