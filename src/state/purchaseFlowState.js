export function createPurchaseFlowState() {
  const state = {
    status: 'idle', // idle | loading | success | failed | restoring
    selectedPlan: 'monthly',
    lastError: '',
    lastAction: null
  };

  return {
    get() { return state; },
    selectPlan(plan) {
      state.selectedPlan = plan || 'monthly';
    },
    start(action = 'purchase') {
      state.status = action === 'restore' ? 'restoring' : 'loading';
      state.lastError = '';
      state.lastAction = action;
    },
    succeed(action = 'purchase') {
      state.status = 'success';
      state.lastError = '';
      state.lastAction = action;
    },
    fail(error = 'Не удалось выполнить действие', action = 'purchase') {
      state.status = 'failed';
      state.lastError = error;
      state.lastAction = action;
    },
    reset() {
      state.status = 'idle';
      state.lastError = '';
    }
  };
}
