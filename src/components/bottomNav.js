export function renderBottomNav({ route }) {
  const items = [
    ['home', '🏠', 'Главная'],
    ['solve', '✏️', 'Решение'],
    ['history', '🕘', 'История'],
    ['profile', '👤', 'Профиль']
  ];

  return `
    <nav class="bottom-nav" aria-label="Навигация">
      ${items.map(([key, icon, label]) => `
        <button class="nav-btn ${route === key ? 'active' : ''}" data-nav="${key}" aria-label="${label}" title="${label}">
          <span class="nav-icon">${icon}</span>
        </button>
      `).join('')}
    </nav>
  `;
}
