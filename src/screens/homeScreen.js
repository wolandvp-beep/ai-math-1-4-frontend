export function renderHomeScreen({ t, state }) {
  const districts = [
    {
      className: 'v26-district-story',
      emblem: 'district-story.svg',
      overline: 'Story Harbor',
      title: 'Сюжетные задачи',
      text: 'Понимай, какое действие выбрать по слову-подсказке и смыслу задачи.',
      route: 'solve',
      tag: 'Ещё • Убрали • Подарили',
      note: 'Отсек понимания'
    },
    {
      className: 'v26-district-example',
      emblem: 'district-example.svg',
      overline: 'Pulse Arcade',
      title: 'Примеры и выражения',
      text: 'Световая арка вычислений для счёта, тренировки темпа и длинных выражений.',
      route: 'solve',
      tag: '48 + 27 • (12 - 4) + 7',
      note: 'Отсек ритма'
    },
    {
      className: 'v26-district-equation',
      emblem: 'district-equation.svg',
      overline: 'Equation Gate',
      title: 'Уравнения',
      text: 'Находи неизвестное через ясные шаги и без перегруза взрослыми терминами.',
      route: 'solve',
      tag: 'x + 6 = 15',
      note: 'Отсек логики'
    },
    {
      className: 'v26-district-archive',
      emblem: 'district-arcade.svg',
      overline: 'Archive Loop',
      title: 'История решений',
      text: 'Возвращайся к прошлым объяснениям как к модулям неонового города.',
      route: 'history',
      tag: 'Библиотека • Модули • Повторение',
      note: 'Отсек памяти'
    }
  ];

  return `
    <section class="screen ${state.route === 'home' ? 'active' : ''}" data-screen="home">
      <div class="hero hero-main hero-premium skyline-home-hero v22-home-hero v26-home-hero">
        <div class="hero-grid hero-grid-single v22-hero-grid">
          <div class="hero-text premium-copy v22-hero-copy">
            <div class="hero-chip">Neon Skyline Classroom</div>
            <h1>${t('app.name')}</h1>
            <p>Цифровой город будущего, где математика ощущается как суперсила: световые трассы, стеклянные панели, живые ярлыки и художественный bright cyber без взрослой мрачности.</p>
            <div class="hero-actions row v22-hero-actions">
              <button class="primary primary-hero v22-start-btn" data-nav="solve">Начать</button>
              <div class="mini-orbit-badges v22-signal-badges">
                <span>Задача</span>
                <span>Пример</span>
                <span>Уравнение</span>
                <span>Выражение</span>
              </div>
            </div>
          </div>
        </div>
        <div class="hero-status-row premium-stats v22-hero-stats v26-hero-stats">
          <div class="hero-status-pill"><span>Мир приложения</span><b>Неоновый горизонт • стеклянные модули • световые линии • мягкая sci-fi глубина</b></div>
          <div class="hero-status-pill"><span>Тон приложения</span><b>Премиально, художественно, ярко, понятно и безопасно для детей 7–10 лет</b></div>
        </div>
      </div>

      <div class="card quick-card premium-card v22-command-deck skyline-overview-card v26-home-deck">
        <div class="v22-command-top v26-command-top">
          <div>
            <div class="section-overline">Карта города</div>
            <div class="quick-title">Выбери отсек неонового города</div>
          </div>
          <div class="panel-badge">District identity pass</div>
        </div>

        <div class="v26-district-grid">
          ${districts.map((district, index) => `
            <button class="v26-district-card ${district.className}" data-nav="${district.route}">
              <span class="v26-district-bg"></span>
              <span class="v26-district-rail"></span>
              <span class="v26-district-head">
                <img src="./src/assets/generated/${district.emblem}" alt="" class="v26-district-emblem" />
                <span>
                  <span class="v26-district-overline">${district.overline}</span>
                  <strong>${district.title}</strong>
                </span>
              </span>
              <small>${district.text}</small>
              <span class="v26-district-footer">
                <span class="v26-district-tag">${district.tag}</span>
                <span class="v26-district-note">${district.note}</span>
              </span>
              <span class="v26-district-index">0${index + 1}</span>
            </button>
          `).join('')}
        </div>
      </div>

      <div class="card quick-card premium-card v22-showcase-grid skyline-overview-card v26-showcase-grid">
        <div class="v22-mini-panel v22-mini-panel-home v26-mini-panel">
          <div class="feature-icon">◈</div>
          <b>У каждого режима свой характер</b>
          <div class="muted small">Карточки теперь ощущаются как разные районы одного футуристического города, а не как повторяющиеся блоки.</div>
        </div>
        <div class="v22-mini-panel v22-mini-panel-solve v26-mini-panel">
          <div class="feature-icon">◎</div>
          <b>Путь ребёнка стал яснее</b>
          <div class="muted small">От стартового экрана до архива решения всё связано световыми маршрутами и понятными ярлыками.</div>
        </div>
        <button class="v22-history-banner v26-history-banner" data-nav="history">
          <div class="v22-history-badge">Skyline route</div>
          <strong>Открой неоновый архив и продолжай путь по модулям</strong>
          <span>Каждое прошлое решение хранится как отдельный отсек города будущего.</span>
        </button>
      </div>
    </section>
  `;
}
