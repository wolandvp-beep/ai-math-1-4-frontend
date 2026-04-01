export function renderStoreBillingScreen({ state, purchaseFlow, products = [] }) {
  const statusText =
    purchaseFlow.status === 'loading' ? 'Идёт оформление покупки…' :
    purchaseFlow.status === 'restoring' ? 'Идёт восстановление покупки…' :
    purchaseFlow.status === 'success' ? 'Последнее действие выполнено.' :
    purchaseFlow.status === 'failed' ? (purchaseFlow.lastError || 'Действие не выполнено.') :
    'Выберите план и продолжите.';

  return `
    <section class="screen ${state.route === 'storeBilling' ? 'active' : ''}" data-screen="storeBilling">
      <div class="card">
        <h2 class="section-title">Покупка в магазине</h2>
        <div class="item" style="margin-bottom:12px;">
          <div class="item-title">Состояние покупки</div>
          <div class="muted small">${statusText}</div>
        </div>

        <div class="list">
          ${products.map(product => `
            <button class="item" data-plan-select="${product.key}">
              <div class="item-title">${product.title}</div>
              <div class="muted small">${product.priceLabel}</div>
            </button>
          `).join('')}
        </div>

        <div class="row" style="margin-top:14px;">
          <button class="primary" data-stub-action="start-store-purchase">Оформить покупку</button>
          <button class="secondary" data-stub-action="restore-store-purchase">Восстановить покупку</button>
          <button class="secondary" data-nav="subscription">Назад</button>
        </div>
      </div>
    </section>
  `;
}
