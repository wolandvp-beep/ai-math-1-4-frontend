export function renderExternalPaymentScreen({ state, webPayment, subscription }) {
  const statusText =
    webPayment.status === 'creating' ? 'Создаётся платёжная ссылка…' :
    webPayment.status === 'waiting_return' ? 'Оплатите на сайте и затем вернитесь в приложение.' :
    webPayment.status === 'synced' ? 'Доступ обновлён с сервера.' :
    webPayment.status === 'failed' ? (webPayment.lastError || 'Не удалось выполнить действие.') :
    'Оплата проходит на внешнем сайте. После оплаты доступ обновится через аккаунт.';

  const accessText = webPayment.access === 'premium' || subscription.status === 'active'
    ? 'Премиум-доступ активен'
    : 'Сейчас активен базовый доступ';

  return `
    <section class="screen ${state.route === 'externalPayment' ? 'active' : ''}" data-screen="externalPayment">
      <div class="card">
        <h2 class="section-title">Оплата на сайте</h2>
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
            <div class="item-title">План на месяц</div>
            <div class="muted small">Основной внешний платёжный маршрут.</div>
          </button>
          <button class="item" data-web-plan="family">
            <div class="item-title">Семейный план</div>
            <div class="muted small">Для будущего семейного доступа.</div>
          </button>
        </div>

        <div class="row" style="margin-top:14px;">
          <button class="primary" data-stub-action="create-web-checkout">Перейти к оплате</button>
          <button class="secondary" data-stub-action="open-web-checkout">Открыть ссылку</button>
          <button class="secondary" data-stub-action="refresh-web-access">Обновить доступ</button>
          <button class="secondary" data-nav="subscription">Назад</button>
        </div>
      </div>
    </section>
  `;
}
