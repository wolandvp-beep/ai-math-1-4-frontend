const KEY = 'reshayka_user_profile';

function fallback() {
  return { name: '', email: '', childName: '', serverSynced: false };
}

export const profileStorage = {
  read() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : fallback();
    } catch {
      return fallback();
    }
  },
  write(value) {
    localStorage.setItem(KEY, JSON.stringify(value));
  },
  clear() {
    localStorage.removeItem(KEY);
  }
};
