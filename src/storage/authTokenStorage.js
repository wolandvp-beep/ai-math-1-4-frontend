const KEY = 'reshayka_auth_token';

export const authTokenStorage = {
  read() {
    return localStorage.getItem(KEY) || '';
  },
  write(token) {
    localStorage.setItem(KEY, token || '');
  },
  clear() {
    localStorage.removeItem(KEY);
  }
};
