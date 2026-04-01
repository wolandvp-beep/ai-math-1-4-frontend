import { sessionStorageLayer } from '../storage/sessionStorage.js';
import { authTokenStorage } from '../storage/authTokenStorage.js';

export function createUserSessionState() {
  const persisted = sessionStorageLayer.read();
  const token = authTokenStorage.read();

  const state = {
    authStatus: persisted.authStatus || (token ? 'authenticated' : 'guest'),
    user: persisted.user || null,
    lastAuthAction: persisted.lastAuthAction || null,
    token: token || ''
  };

  function persist() {
    sessionStorageLayer.write({
      authStatus: state.authStatus,
      user: state.user,
      lastAuthAction: state.lastAuthAction
    });
    if (state.token) authTokenStorage.write(state.token);
    else authTokenStorage.clear();
  }

  return {
    get() { return state; },
    setGuest() {
      state.authStatus = 'guest';
      state.user = null;
      state.lastAuthAction = 'guest';
      state.token = '';
      persist();
    },
    setAuthenticated(user, token = '') {
      state.authStatus = 'authenticated';
      state.user = user;
      state.lastAuthAction = 'login';
      state.token = token || state.token || '';
      persist();
    },
    markAction(action) {
      state.lastAuthAction = action;
      persist();
    },
    setToken(token) {
      state.token = token || '';
      persist();
    }
  };
}
