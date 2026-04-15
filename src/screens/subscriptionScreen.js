export function renderSubscriptionScreens({ state, subscription }) {
  const subStateText = subscription.status === 'active'
    ? `Текущий статус: активна (${subscription.plan || 'план'})`
    : subscription.status === 'grace'
      ? 'Текущий статус: льготный период'
      : 'Текущий статус: не подключена';
  return `
    <section class="screen ${state.route === 'subscription' ? 'active' : ''}" data-screen="subscription">
      <div class="card">
        <h2 class="section-title">Подписка</h2>
        <div class="item" style="margin-bottom:12px;">
          <div class="item-title">Состояние подписки</div>
          <div class="muted small">${subStateText}</div>
        </div>
        <div class="list">
          <div class="item">
            <div class="item-title">Базовый доступ</div>
            <div class="muted small">Демо-режим без реальной оплаты. Позже здесь будут лимиты и доступы.</div>
          </div>
          <button class="item" data-nav="externalPayment">
            <div class="item-title">Оплата на сайте</div>
            <div class="muted small">Главный путь оплаты через внешний сервис.</div>
          </button>
          <button class="item" data-nav="plans">
            <div class="item-title">Планы</div>
            <div class="muted small">Экран выбора тарифов и преимуществ.</div>
          </button>
          <button class="item" data-nav="billing">
            <div class="item-title">Покупка через магазин (не основной путь)</div>
            <div class="muted small">Маршрут App Store / Google Play для реальной подписки.</div>
          </button>
          <button class="item" data-nav="storeBilling">
            <div class="item-title">Оплата и покупки</div>
            <div class="muted small">История покупок, способ оплаты и восстановление доступа.</div>
          </button>
        </div>
      </div>
    </section>

    <section class="screen ${state.route === 'plans' ? 'active' : ''}" data-screen="plans">
      <div class="card">
        <h2 class="section-title">Планы подписки</h2>
        <div class="grid">
          <div class="item">
            <div class="item-title">Месяц</div>
            <div class="muted small">Основной план подписки. Точка для будущей реальной монетизации.</div>
          </div>
          <div class="item">
            <div class="item-title">Семейный доступ</div>
            <div class="muted small">Позже здесь будет семейный пакет с несколькими детьми.</div>
          </div>
          <div class="row">
            <button class="primary" data-stub-action="plans-submit">Продолжить</button>
            <button class="secondary" data-nav="subscription">Назад</button>
          </div>
        </div>
      </div>
    </section>

    <section class="screen ${state.route === 'billing' ? 'active' : ''}" data-screen="billing">
      <div class="card">
        <h2 class="section-title">Оплата и покупки</h2>
        <div class="list">
          <div class="item">
            <div class="item-title">Способ оплаты</div>
            <div class="muted small">Будет подключён позже вместе с реальной подпиской.</div>
          </div>
          <div class="item">
            <div class="item-title">Восстановить покупку</div>
            <div class="muted small">Кнопка для App Store / Google Play будет подключена в финале.</div>
          </div>
          <button class="item" data-stub-action="deactivate-subscription">
            <div class="item-title">Отключить демо-подписку</div>
            <div class="muted small">Сброс демо-состояния подписки.</div>
          </button>
          <div class="row">
            <button class="secondary" data-stub-action="restore-purchase">Восстановить</button>
            <button class="secondary" data-nav="subscription">Назад</button>
          </div>
        </div>
      </div>
    </section>
  `;
}
