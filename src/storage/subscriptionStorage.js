const KEY = 'reshayka_subscription_state';

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : { status: 'inactive', plan: null, renewalAt: null, source: null };
  } catch {
    return { status: 'inactive', plan: null, renewalAt: null, source: null };
  }
}

function write(value) {
  localStorage.setItem(KEY, JSON.stringify(value));
}

export const subscriptionStorageLayer = {
  read,
  write
};
