export function renderProfileScreen({ t, state, session, subscription }) {
  const authLabel = session.authStatus === 'authenticated' ? 'Выполнен вход' : 'Гостевой режим';
  const subLabel = subscription.status === 'active' ? 'Активна' : 'Не подключена';
  return `
    <section class="screen ${state.route === 'profile' ? 'active' : ''}" data-screen="profile">
      <div class="card">
        <h2 class="section-title">${t('profile.title')}</h2>
        <div class="grid two" style="margin-bottom:10px;">
          <div class="kpi"><div class="muted small">Аккаунт</div><div class="n" style="font-size:1rem;">${authLabel}</div></div>
          <div class="kpi"><div class="muted small">Подписка</div><div class="n" style="font-size:1rem;">${subLabel}</div></div>
        </div>
        <button class="setting" data-nav="account"><span>${t('profile.account')}</span><span>›</span></button>
        <button class="setting" data-nav="userProfile"><span>Профиль пользователя</span><span>›</span></button>
        <button class="setting" data-nav="subscription"><span>${t('profile.subscription')}</span><span>›</span></button>
        <button class="setting" data-open-stub="language"><span>${t('profile.language')}</span><span>ru</span></button>
        <button class="setting" data-open-stub="notifications"><span>${t('profile.notifications')}</span><span>›</span></button>
        <button class="setting" data-nav="parents"><span>${t('profile.family')}</span><span>›</span></button>
        <button class="setting" data-open-stub="privacy"><span>${t('profile.privacy')}</span><span>›</span></button>
        <button class="setting" data-open-stub="about"><span>${t('profile.about')}</span><span>›</span></button>
        <button class="setting" data-open-stub="roadmap"><span>${t('profile.roadmap')}</span><span>›</span></button>
      </div>
    </section>
  `;
}
