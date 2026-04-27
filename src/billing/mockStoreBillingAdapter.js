import { STORE_CONFIG } from './storeConfig.js';

function delay(ms = 400) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const mockStoreBillingAdapter = {
  async getProducts() {
    await delay(150);
    return Object.entries(STORE_CONFIG.products).map(([key, item]) => ({
      key,
      productId: item.productId,
      title: item.title,
      priceLabel: key === 'monthly' ? '299 ₽ / мес' : '1990 ₽ / год'
    }));
  },

  async purchase(planKey = 'monthly') {
    await delay(500);
    return {
      ok: true,
      platform: STORE_CONFIG.provider,
      plan: planKey,
      transactionId: `mock_tx_${Date.now()}`
    };
  },

  async restore() {
    await delay(450);
    return {
      ok: true,
      restored: true
    };
  }
};
