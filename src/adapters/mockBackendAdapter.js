import { ENV } from '../config/env.js';

const MOCK = {
  auth: {
    login: {
      token: 'mock-token-123',
      user: { id: 'user_mock_1', name: 'Анна', email: 'anna@example.com', childName: 'Миша' }
    },
    register: {
      token: 'mock-token-456',
      user: { id: 'user_mock_2', name: 'Новый пользователь', email: 'new@example.com', childName: '' }
    },
    recover: { ok: true },
    logout: { ok: true }
  },
  profile: {
    id: 'user_mock_1',
    name: 'Анна',
    email: 'anna@example.com',
    childName: 'Миша',
    language: 'ru'
  },
  subscription: {
    status: 'active',
    plan: 'monthly',
    renewalAt: '2026-05-01T10:00:00Z',
    source: 'server'
  },
  restore: { ok: true }
};

function delay(ms = 250) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const mockBackendAdapter = {
  async login(values) {
    await delay();
    return {
      ...MOCK.auth.login,
      user: {
        ...MOCK.auth.login.user,
        email: values.email || MOCK.auth.login.user.email
      }
    };
  },
  async register(values) {
    await delay();
    return {
      ...MOCK.auth.register,
      user: {
        id: 'user_mock_new',
        name: values.name || 'Новый пользователь',
        email: values.email || 'new@example.com',
        childName: ''
      }
    };
  },
  async recover() {
    await delay();
    return MOCK.auth.recover;
  },
  async logout() {
    await delay();
    return MOCK.auth.logout;
  },
  async getProfile() {
    await delay();
    return MOCK.profile;
  },
  async updateProfile(token, payload) {
    await delay();
    return {
      ok: true,
      profile: {
        ...MOCK.profile,
        name: payload.name || MOCK.profile.name,
        childName: payload.childName || MOCK.profile.childName,
        language: payload.language || ENV.DEFAULT_LANGUAGE
      }
    };
  },
  async getSubscription() {
    await delay();
    return MOCK.subscription;
  },
  async restorePurchase() {
    await delay();
    return MOCK.restore;
  }
};
