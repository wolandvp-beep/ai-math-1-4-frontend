export function renderProfileScreen({ t, state, session, subscription }) {
  const authLabel = session.authStatus === 'authenticated' ? 'Выполнен вход' : 'Гостевой режим';
  const subLabel = subscription.status === 'active' ? 'Активна' : 'Не подключена';

  return `
    <section class="screen ${state.route === 'profile' ? 'active' : ''}" data-screen="profile">
      <div class="hero" style="background:linear-gradient(135deg,#ff5ca8 0%, #ff8f6b 45%, #ffd36b 100%);">
        <div class="badge">🎨 Яркий личный раздел</div>
        <h1 style="font-size:2rem;">Профиль</h1>
        <p>Аккаунт, доступ, семья и будущие настройки — в одном красивом месте.</p>
        <div class="hero-stats">
          <div class="hero-stat"><span class="small">Аккаунт</span><b style="font-size:1rem;line-height:1.2;">${authLabel}</b></div>
          <div class="hero-stat"><span class="small">Подписка</span><b style="font-size:1rem;line-height:1.2;">${subLabel}</b></div>
        </div>
      </div>

      <div class="card">
        <button class="setting" data-nav="account"><span><span class="inline-icon">🔐</span>${t('profile.account')}</span><span>›</span></button>
        <button class="setting" data-nav="userProfile"><span><span class="inline-icon">🪪</span>Профиль пользователя</span><span>›</span></button>
        <button class="setting" data-nav="subscription"><span><span class="inline-icon">💎</span>${t('profile.subscription')}</span><span>›</span></button>
        <button class="setting" data-open-stub="language"><span><span class="inline-icon">🌍</span>${t('profile.language')}</span><span>ru</span></button>
        <button class="setting" data-open-stub="notifications"><span><span class="inline-icon">🔔</span>${t('profile.notifications')}</span><span>›</span></button>
        <button class="setting" data-nav="parents"><span><span class="inline-icon">👨‍👩‍👧</span>${t('profile.family')}</span><span>›</span></button>
        <button class="setting" data-open-stub="privacy"><span><span class="inline-icon">🛡️</span>${t('profile.privacy')}</span><span>›</span></button>
        <button class="setting" data-open-stub="about"><span><span class="inline-icon">ℹ️</span>${t('profile.about')}</span><span>›</span></button>
        <button class="setting" data-open-stub="roadmap"><span><span class="inline-icon">🧭</span>${t('profile.roadmap')}</span><span>›</span></button>
      </div>
    </section>
  `;
}
