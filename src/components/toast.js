export function createToastHost() {
  const host = document.createElement('div');
  host.className = 'toast-wrap';
  document.body.appendChild(host);

  return function showToast(message) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = message;
    host.appendChild(el);
    setTimeout(() => el.remove(), 2200);
  };
}
