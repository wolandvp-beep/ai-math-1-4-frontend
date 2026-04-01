export function renderBottomNav({ route }) {
  const items = [
    ['home', './src/assets/icon-home.png', 'Главная'],
    ['solve', './src/assets/icon-solve.png', 'Решение'],
    ['history', './src/assets/icon-history.png', 'История'],
    ['profile', './src/assets/icon-profile.png', 'Профиль']
  ];
  return `
    <nav class="bottom-nav" aria-label="Навигация">
      ${items.map(([key, icon, label]) => `
        <button class="nav-btn ${route === key ? 'active' : ''}" data-nav="${key}" aria-label="${label}" title="${label}">
          <img src="${icon}" alt="${label}">
        </button>
      `).join('')}
    </nav>
  `;
}
