<script lang="ts">
  import './home.css';

  const menuItems = [
    { icon: '📚', label: 'Познавательные статьи', href: '/articles' },
    { icon: '🚗', label: 'Машинка-программист', href: '/car-play' },
    { icon: '👨‍👩‍👧', label: 'Родителям', href: '/parents' },
    { icon: '⚖️', label: 'Правовая информация', href: '/legal' }
  ];

  const news = [
    {
      id: 1,
      date: '12 октября 2026',
      title: 'Запуск платформы Kids Informatics',
      excerpt: 'Мы рады представить нашу платформу для изучения основ программирования через игру. Начните с "Машинки-программиста" — первого интерактивного урока!',
      tag: 'Новость'
    },
    {
      id: 2,
      date: '15 октября 2026',
      title: 'Скоро: новые уровни и задачи',
      excerpt: 'В ближайшее время мы добавим режим головоломок с готовыми заданиями, системой достижений и таблицей лидеров.',
      tag: 'Анонс'
    },
    {
      id: 3,
      date: '20 октября 2026',
      title: 'Статья: "Зачем детям программирование?"',
      excerpt: 'Разбираем, как базовые навыки алгоритмического мышления помогают в школе и развивают логику.',
      tag: 'Статья'
    }
  ];
</script>

<svelte:head>
  <title>Kids Informatics — Программирование для детей</title>
  <meta name="description" content="Интерактивная платформа для изучения основ программирования через игру" />
</svelte:head>

<div class="home">
  <!-- Шапка сайта -->
  <header class="site-header">
    <div class="header-inner">
      <a href="/" class="logo">
        <span class="logo-icon">🚗</span>
        <span class="logo-text">Kids Informatics</span>
      </a>
      <nav class="header-nav">
        <a href="/car-play" class="btn-hero">Начать играть →</a>
      </nav>
    </div>
  </header>

  <!-- Главный баннер -->
  <section class="hero">
    <div class="hero-inner">
      <h1 class="hero-title">Учим программировать через игру</h1>
      <p class="hero-subtitle">
        Интерактивная платформа, где дети от 6 лет осваивают основы алгоритмов, 
        логики и последовательного мышления — без скучных лекций.
      </p>
      <a href="/car-play" class="btn-hero">Начать играть →</a>
    </div>
  </section>

  <!-- Основной контент: сайдбар + новости -->
  <div class="content-wrapper">
    <!-- Левое меню -->
    <aside class="sidebar">
      <nav class="menu">
        {#each menuItems as item}
          <a href={item.href} class="menu-item">
            <span class="menu-icon">{item.icon}</span>
            <span class="menu-label">{item.label}</span>
          </a>
        {/each}
      </nav>
    </aside>

    <!-- Центральная часть с новостями -->
    <main class="main-content">
      <h2 class="section-title">Новости и обновления</h2>
      
      <div class="news-list">
        {#each news as item}
          <article class="news-card">
            <div class="news-header">
              <span class="news-tag">{item.tag}</span>
              <time class="news-date">{item.date}</time>
            </div>
            <h3 class="news-title">{item.title}</h3>
            <p class="news-excerpt">{item.excerpt}</p>
            <a href="#" class="news-link">Читать далее →</a>
          </article>
        {/each}
      </div>
    </main>
  </div>

  <!-- Подвал -->
  <footer class="site-footer">
    <div class="footer-inner">
      <p>© 2026 Kids Informatics. Все права защищены.</p>
      <div class="footer-links">
        <a href="/legal">Правовая информация</a>
        <a href="/parents">Родителям</a>
      </div>
    </div>
  </footer>
</div>