export function renderBottomNav({ route }) {
  const items = [
    ['home', './src/assets/premium_pass7/nav/nav-home-premium.png', 'Главная'],
    ['solve', './src/assets/premium_pass6/nav/nav-solve-premium.png', 'Решение'],
    ['history', './src/assets/premium_pass6/nav/nav-history-premium.png', 'История'],
    ['profile', './src/assets/premium_pass6/nav/nav-profile-premium.png', 'Профиль']
  ];

  return `
    <nav class="bottom-nav" aria-label="Навигация">
      ${items.map(([key, icon, label]) => `
        <button class="nav-btn ${route === key ? 'active' : ''}" data-nav="${key}" aria-label="${label}" title="${label}">
          <img class="nav-icon-img" src="${icon}" alt="${label}" />
          <span class="nav-label">${label}</span>
        </button>
      `).join('')}
    </nav>
  `;
}
