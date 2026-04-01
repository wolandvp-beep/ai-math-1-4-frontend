export function renderBottomNav({ route }) {
  const items = [
    ['home', './src/assets/generated/nav-home.svg', 'Главная'],
    ['solve', './src/assets/generated/nav-solve.svg', 'Разбор'],
    ['history', './src/assets/generated/nav-history.svg', 'Архив'],
    ['profile', './src/assets/generated/nav-profile.svg', 'Профиль']
  ];

  return `
    <nav class="bottom-nav v25-bottom-nav" aria-label="Навигация">
      ${items.map(([key, icon, label], index) => `
        <button class="nav-btn v25-nav-btn ${route === key ? 'active' : ''}" data-nav="${key}" aria-label="${label}" title="${label}">
          <span class="v25-nav-orbit v25-nav-orbit-${index + 1}"></span>
          <img class="nav-icon-img" src="${icon}" alt="" />
          <span class="v25-nav-label">${label}</span>
        </button>
      `).join('')}
    </nav>
  `;
}
