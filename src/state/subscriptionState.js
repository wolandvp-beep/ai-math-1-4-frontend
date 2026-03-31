import { subscriptionStorageLayer } from '../storage/subscriptionStorage.js';

export function createSubscriptionState() {
  const persisted = subscriptionStorageLayer.read();
  const state = {
    status: persisted.status || 'inactive',
    plan: persisted.plan || null,
    renewalAt: persisted.renewalAt || null,
    source: persisted.source || null
  };

  function persist() {
    subscriptionStorageLayer.write(state);
  }

  return {
    get() { return state; },
    activate(plan = 'monthly', source = 'demo') {
      state.status = 'active';
      state.plan = plan;
      state.source = source;
      state.renewalAt = null;
      persist();
    },
    deactivate() {
      state.status = 'inactive';
      state.plan = null;
      state.source = null;
      state.renewalAt = null;
      persist();
    },
    setGrace(plan = 'monthly') {
      state.status = 'grace';
      state.plan = plan;
      persist();
    }
  };
}
