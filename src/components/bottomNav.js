export function renderBottomNav({ route }) {
  const items = [
    ['home', './src/assets/nav-home.svg', 'Главная'],
    ['solve', './src/assets/nav-solve.svg', 'Решение'],
    ['history', './src/assets/nav-history.svg', 'История'],
    ['profile', './src/assets/nav-profile.svg', 'Профиль']
  ];

  return `
    <nav class="bottom-nav" aria-label="Навигация">
      ${items.map(([key, icon, label]) => `
        <button class="nav-btn ${route === key ? 'active' : ''}" data-nav="${key}" aria-label="${label}" title="${label}">
          <img class="nav-icon-img" src="${icon}" alt="${label}" />
        </button>
      `).join('')}
    </nav>
  `;
}
