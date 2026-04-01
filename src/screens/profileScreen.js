export function renderProfileScreen({ state, session, subscription }) {
  const authLabel = session.authStatus === 'authenticated' ? 'Выполнен вход' : 'Гостевой режим';
  const subLabel = subscription.status === 'active' ? 'Активна' : 'Не подключена';
  return `
    <section class="screen ${state.route === 'profile' ? 'active' : ''}" data-screen="profile">
      <img class="hero-art" src="./src/assets/hero-profile.png" alt="Неоновая панель профиля">
      <div class="card holo">
        <h2 class="section-title">Профиль</h2>
        <div class="kv">
          <div class="mini-card"><div class="label">Аккаунт</div><div class="value">${authLabel}</div></div>
          <div class="mini-card"><div class="label">Доступ</div><div class="value">${subLabel}</div></div>
        </div>
      </div>
      <div class="card">
        <button class="setting" data-nav="account"><span><span class="inline-icon">🔐</span>Аккаунт</span><span>›</span></button>
        <button class="setting" data-nav="userProfile"><span><span class="inline-icon">🪪</span>Профиль пользователя</span><span>›</span></button>
        <button class="setting" data-nav="subscription"><span><span class="inline-icon">💎</span>Подписка</span><span>›</span></button>
        <button class="setting" data-nav="externalPayment"><span><span class="inline-icon">🌐</span>Оплата на сайте</span><span>›</span></button>
        <button class="setting" data-open-stub="language"><span><span class="inline-icon">🌍</span>Язык</span><span>ru</span></button>
      </div>
    </section>
  `;
}
