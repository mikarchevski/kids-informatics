<script lang="ts">
  import './home.css';

  let { children } = $props();
</script>

<div class="home">
  <!-- Шапка сайта -->
<header class="site-header">
    <div class="header-inner">
      <a href="/" class="logo">
        <span class="logo-text">Информатика для детей</span>
      </a>
      <nav class="header-nav">
        <a href="/car-play" class="btn-hero">Начать играть →</a>
      </nav>
    </div>
  </header>

  <!-- Контент страницы (подставится автоматически) -->
  {@render children()}

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