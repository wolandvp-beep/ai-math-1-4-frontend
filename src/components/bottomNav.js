export function renderBottomNav({ t, route }) {
  const items = [
    ['home', t('nav.home')],
    ['solve', t('nav.solve')],
    ['history', t('nav.history')],
    ['profile', t('nav.profile')]
  ];

  return `
    <nav class="bottom-nav">
      ${items.map(([key, label]) => `
        <button class="nav-btn ${route === key ? 'active' : ''}" data-nav="${key}">${label}</button>
      `).join('')}
    </nav>
  `;
}
