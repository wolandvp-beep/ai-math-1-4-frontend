export function validateEmail(value) {
  const email = String(value || '').trim();
  if (!email) return 'Введите email.';
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  return ok ? '' : 'Введите корректный email.';
}

export function validatePassword(value) {
  const password = String(value || '');
  if (!password) return 'Введите пароль.';
  if (password.length < 6) return 'Пароль должен быть не короче 6 символов.';
  return '';
}

export function validateName(value) {
  const name = String(value || '').trim();
  if (!name) return 'Введите имя.';
  if (name.length < 2) return 'Имя слишком короткое.';
  return '';
}
