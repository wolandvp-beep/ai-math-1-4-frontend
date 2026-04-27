const KEY = 'reshayka_install_id';

function createInstallId() {
  const cryptoApi = globalThis.crypto;
  if (cryptoApi && typeof cryptoApi.randomUUID === 'function') {
    return cryptoApi.randomUUID();
  }
  return `install_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export const installIdStorage = {
  read() {
    return localStorage.getItem(KEY) || '';
  },
  readOrCreate() {
    const existing = this.read();
    if (existing) return existing;
    const created = createInstallId();
    localStorage.setItem(KEY, created);
    return created;
  },
  clear() {
    localStorage.removeItem(KEY);
  }
};
