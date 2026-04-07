const KEY = 'reshayka_user_session';

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : { authStatus: 'guest', user: null, lastAuthAction: null };
  } catch {
    return { authStatus: 'guest', user: null, lastAuthAction: null };
  }
}

function write(value) {
  localStorage.setItem(KEY, JSON.stringify(value));
}

export const sessionStorageLayer = {
  read,
  write
};
