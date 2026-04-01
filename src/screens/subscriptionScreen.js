export function renderSubscriptionScreens({ state, subscription }) {
  const subStateText = subscription.status === 'active'
    ? `Текущий статус: активна (${subscription.plan || 'план'})`
    : subscription.status === 'grace'
      ? 'Текущий статус: льготный период'
      : 'Текущий статус: не подключена';
  return `
    <section class="screen ${state.route === 'subscription' ? 'active' : ''}" data-screen="subscription">
      <div class="card glass-card premium-card skyline-scene-card skyline-scene-profile-grid v24-access-card">
        <div class="v24-access-head">
          <div>
            <div class="section-overline">Подписка</div>
            <h2 class="section-title">Доступ и планы</h2>
          </div>
          <div class="panel-badge">Billing skyline</div>
        </div>
        <div class="item premium-item v24-access-status" style="margin-bottom:12px;">
          <div class="item-title">Состояние подписки</div>
          <div class="muted small">${subStateText}</div>
        </div>
        <div class="list v24-access-list">
          <div class="item premium-item v24-access-item"><div class="v24-access-icon">◈</div><div><div class="item-title">Базовый доступ</div><div class="muted small">Демо-режим без реальной оплаты. Позже здесь будут лимиты и доступы.</div></div></div>
          <button class="item premium-item v24-access-item" data-nav="externalPayment"><div class="v24-access-icon">✦</div><div><div class="item-title">Оплата на сайте</div><div class="muted small">Главный путь оплаты через внешний сервис.</div></div></button>
          <button class="item premium-item v24-access-item" data-nav="plans"><div class="v24-access-icon">◎</div><div><div class="item-title">Планы</div><div class="muted small">Экран выбора тарифов и преимуществ.</div></div></button>
          <button class="item premium-item v24-access-item" data-nav="billing"><div class="v24-access-icon">⌁</div><div><div class="item-title">Покупка через магазин</div><div class="muted small">Не основной путь. Маршрут App Store / Google Play для будущей подписки.</div></div></button>
          <button class="item premium-item v24-access-item" data-nav="storeBilling"><div class="v24-access-icon">⬢</div><div><div class="item-title">Оплата и покупки</div><div class="muted small">История покупок, способ оплаты и восстановление доступа.</div></div></button>
        </div>
      </div>
    </section>

    <section class="screen ${state.route === 'plans' ? 'active' : ''}" data-screen="plans">
      <div class="card glass-card premium-card skyline-scene-card skyline-scene-history-grid v24-form-panel">
        <div class="v24-form-head"><div class="section-overline">Планы</div><h2 class="section-title">Планы подписки</h2></div>
        <div class="grid v24-form-grid">
          <div class="item premium-item v24-access-item"><div class="v24-access-icon">◌</div><div><div class="item-title">Месяц</div><div class="muted small">Основной план подписки и точка для будущей реальной монетизации.</div></div></div>
          <div class="item premium-item v24-access-item"><div class="v24-access-icon">◐</div><div><div class="item-title">Семейный доступ</div><div class="muted small">Позже здесь будет семейный пакет с несколькими детьми.</div></div></div>
          <div class="row"><button class="primary" data-stub-action="plans-submit">Продолжить</button><button class="secondary" data-nav="subscription">Назад</button></div>
        </div>
      </div>
    </section>

    <section class="screen ${state.route === 'billing' ? 'active' : ''}" data-screen="billing">
      <div class="card glass-card premium-card skyline-scene-card skyline-scene-solve v24-form-panel">
        <div class="v24-form-head"><div class="section-overline">Платёжный отсек</div><h2 class="section-title">Оплата и покупки</h2></div>
        <div class="list v24-access-list">
          <div class="item premium-item v24-access-item"><div class="v24-access-icon">◎</div><div><div class="item-title">Способ оплаты</div><div class="muted small">Будет подключён позже вместе с реальной подпиской.</div></div></div>
          <div class="item premium-item v24-access-item"><div class="v24-access-icon">◈</div><div><div class="item-title">Восстановить покупку</div><div class="muted small">Кнопка для App Store / Google Play будет подключена в финале.</div></div></div>
          <button class="item premium-item v24-access-item" data-stub-action="deactivate-subscription"><div class="v24-access-icon">⌁</div><div><div class="item-title">Отключить демо-подписку</div><div class="muted small">Сброс демо-состояния подписки.</div></div></button>
          <div class="row"><button class="secondary" data-stub-action="restore-purchase">Восстановить</button><button class="secondary" data-nav="subscription">Назад</button></div>
        </div>
      </div>
    </section>
  `;
}
