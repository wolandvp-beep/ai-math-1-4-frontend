export function createBillingService({ sessionApi, subscriptionApi, backend }) {
  return {
    async syncSubscription() {
      const token = sessionApi.get().token;
      if (!token) throw new Error('Нет токена');
      const subscription = await backend.getSubscription(token);
      if (subscription.status === 'active') {
        subscriptionApi.activate(subscription.plan || 'monthly', subscription.source || 'server');
      } else if (subscription.status === 'grace') {
        subscriptionApi.setGrace(subscription.plan || 'monthly');
      } else {
        subscriptionApi.deactivate();
      }
      return subscription;
    },

    async restoreFromStore() {
      const token = sessionApi.get().token;
      if (!token) throw new Error('Нет токена');
      return backend.restorePurchase(token);
    }
  };
}
