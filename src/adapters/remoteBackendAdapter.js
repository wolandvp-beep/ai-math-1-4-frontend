import { authApi } from '../api/authApi.js';
import { fetchProfile } from '../api/profileApi.js';
import { updateProfile } from '../api/profileUpdateApi.js';
import { fetchSubscription } from '../api/subscriptionApi.js';
import { restorePurchase } from '../api/restorePurchaseApi.js';

export const remoteBackendAdapter = {
  login(values) {
    return authApi.login(values);
  },
  register(values) {
    return authApi.register(values);
  },
  recover(values) {
    return authApi.recover(values);
  },
  logout(token) {
    return authApi.logout({ token });
  },
  getProfile(token) {
    return fetchProfile(token);
  },
  updateProfile(token, payload) {
    return updateProfile(token, payload);
  },
  getSubscription(token) {
    return fetchSubscription(token);
  },
  restorePurchase(token) {
    return restorePurchase(token);
  }
};
