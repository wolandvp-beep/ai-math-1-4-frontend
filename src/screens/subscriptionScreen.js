export function renderSubscriptionScreens({ state, subscription }) {
  const planLabel = subscription.plan === 'yearly' ? 'год' : subscription.plan === 'monthly' ? 'месяц' : 'план';
  const subStateText = subscription.status === 'active'
    ? `Текущий статус: активна (${planLabel})`
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
            <div class="item-title">Бесплатный доступ</div>
            <div class="muted small">5 решений сразу, затем 1 решение в сутки. Сброс лимита — в 00:00 по Москве. Решением считается финальная отправка.</div>
          </div>
          <button class="item" data-nav="plans">
            <div class="item-title">Тарифы</div>
            <div class="muted small">299 ₽ в месяц или 1990 ₽ в год. На подписке — до 20 решений в сутки.</div>
          </button>
          <button class="item" data-nav="storeBilling">
            <div class="item-title">RuStore</div>
            <div class="muted small">Основной канал монетизации и восстановления подписки.</div>
          </button>
          <button class="item" data-nav="externalPayment">
            <div class="item-title">Служебный экран оплаты</div>
            <div class="muted small">Оставлен только как совместимый маршрут. Основной сценарий — через RuStore.</div>
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
            <div class="muted small">299 ₽ / месяц. До 20 решений в календарные сутки по Москве.</div>
          </div>
          <div class="item">
            <div class="item-title">Год</div>
            <div class="muted small">1990 ₽ / год. Те же лимиты, но выгоднее годового продления по месяцам.</div>
          </div>
          <div class="row">
            <button class="primary" data-nav="storeBilling">Открыть RuStore</button>
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
            <div class="item-title">Канал оплаты</div>
            <div class="muted small">Основной канал монетизации — RuStore. Веб-оплата не является целевым маршрутом.</div>
          </div>
          <div class="item">
            <div class="item-title">Восстановление покупки</div>
            <div class="muted small">Кнопка восстановления сохранена. Реальная проверка покупок RuStore подключается на следующем этапе.</div>
          </div>
          <button class="item" data-stub-action="deactivate-subscription">
            <div class="item-title">Сбросить локальное демо-состояние</div>
            <div class="muted small">Нужно только для тестового сценария до подключения боевой монетизации.</div>
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
