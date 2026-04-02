export function createWebPaymentState() {
  const state = {
    selectedPlan: 'monthly',
    status: 'idle', // idle | creating | waiting_return | synced | failed
    checkoutUrl: '',
    sessionId: '',
    access: 'free',
    expiresAt: null,
    lastError: ''
  };

  return {
    get() { return state; },
    selectPlan(plan) { state.selectedPlan = plan || 'monthly'; },
    startCreating() {
      state.status = 'creating';
      state.lastError = '';
    },
    setCheckout({ checkoutUrl = '', sessionId = '' }) {
      state.checkoutUrl = checkoutUrl;
      state.sessionId = sessionId;
      state.status = 'waiting_return';
    },
    setSynced({ access = 'free', expiresAt = null }) {
      state.access = access;
      state.expiresAt = expiresAt;
      state.status = 'synced';
      state.lastError = '';
    },
    fail(message = 'Не удалось создать платёжную сессию') {
      state.status = 'failed';
      state.lastError = message;
    },
    reset() {
      state.status = 'idle';
      state.checkoutUrl = '';
      state.sessionId = '';
      state.lastError = '';
    }
  };
}
