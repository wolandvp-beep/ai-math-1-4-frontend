export function renderExternalPaymentScreen({ state, webPayment, subscription }) {
  const statusText =
    webPayment.status === 'creating' ? 'Создаётся служебная платёжная ссылка…' :
    webPayment.status === 'waiting_return' ? 'Этот маршрут оставлен только для совместимости.' :
    webPayment.status === 'synced' ? 'Доступ обновлён с сервера.' :
    webPayment.status === 'failed' ? (webPayment.lastError || 'Не удалось выполнить действие.') :
    'Основной путь оплаты — RuStore. Этот экран оставлен как служебный совместимый маршрут.';

  const accessText = webPayment.access === 'premium' || subscription.status === 'active'
    ? 'Премиум-доступ активен'
    : 'Сейчас активен бесплатный доступ';

  return `
    <section class="screen ${state.route === 'externalPayment' ? 'active' : ''}" data-screen="externalPayment">
      <div class="card">
        <h2 class="section-title">Служебный платёжный экран</h2>
        <div class="item" style="margin-bottom:12px;">
          <div class="item-title">Статус</div>
          <div class="muted small">${statusText}</div>
        </div>
        <div class="item" style="margin-bottom:12px;">
          <div class="item-title">Доступ</div>
          <div class="muted small">${accessText}</div>
        </div>

        <div class="list">
          <button class="item" data-web-plan="monthly">
            <div class="item-title">Месяц</div>
            <div class="muted small">299 ₽ / месяц. Целевой канал оплаты — RuStore.</div>
          </button>
          <button class="item" data-web-plan="yearly">
            <div class="item-title">Год</div>
            <div class="muted small">1990 ₽ / год. Тоже будет идти через RuStore.</div>
          </button>
        </div>

        <div class="row" style="margin-top:14px;">
          <button class="primary" data-stub-action="create-web-checkout">Проверить совместимость</button>
          <button class="secondary" data-stub-action="open-web-checkout">Открыть ссылку</button>
          <button class="secondary" data-stub-action="refresh-web-access">Обновить доступ</button>
          <button class="secondary" data-nav="subscription">Назад</button>
        </div>
      </div>
    </section>
  `;
}
