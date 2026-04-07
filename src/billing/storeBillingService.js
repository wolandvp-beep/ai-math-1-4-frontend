export function createStoreBillingService({ billingAdapter, billingService, purchaseFlowApi }) {
  return {
    async loadProducts() {
      return billingAdapter.getProducts();
    },

    async purchase(planKey = 'monthly') {
      purchaseFlowApi.start('purchase');
      try {
        const result = await billingAdapter.purchase(planKey);
        await billingService.syncSubscription().catch(() => null);
        purchaseFlowApi.succeed('purchase');
        return result;
      } catch (error) {
        purchaseFlowApi.fail(error.message || 'Покупка не выполнена', 'purchase');
        throw error;
      }
    },

    async restore() {
      purchaseFlowApi.start('restore');
      try {
        const result = await billingAdapter.restore();
        await billingService.restoreFromStore().catch(() => null);
        await billingService.syncSubscription().catch(() => null);
        purchaseFlowApi.succeed('restore');
        return result;
      } catch (error) {
        purchaseFlowApi.fail(error.message || 'Восстановление не выполнено', 'restore');
        throw error;
      }
    }
  };
}
