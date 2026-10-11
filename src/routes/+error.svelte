<script lang="ts">
  import { page } from '$app/stores';
  import './error.css';
</script>

<svelte:head>
  <title>Страница не найдена — Kids Informatics</title>
</svelte:head>

<div class="error-page">
  <div class="error-content">
    <div class="error-icon">🤖💥</div>
    
    <h1 class="error-title">{page.status}</h1>
    <h2 class="error-subtitle">
      {page.status === 404 ? 'Упс! Робот сломался' : 'Что-то пошло не так'}
    </h2>
    
    <p class="error-text">
      {page.status === 404 
        ? 'Похоже, наш робот запутался в проводах и не может найти эту страницу. Проверьте адрес или вернитесь на главную.' 
        : 'Произошла непредвиденная ошибка. Попробуйте обновить страницу или вернуться на главную.'}
    </p>
    
    <a href="/" class="btn-home">🏠 Вернуться на главную</a>
  </div>
</div>