<script lang="ts">
	import { page } from '$app/state';
	import '../app.css';
	import './home.css';

	let { children } = $props();
	let isMenuOpen = $state(false);

	const menuItems = [
		{ icon: '🏠', label: 'Главная', href: '/' },
		{ icon: '📚', label: 'Познавательные статьи', href: '/articles' },
		{ icon: '👨‍👩‍👧', label: 'Родителям', href: '/parents' },
		{ icon: '⚖️', label: 'Правовая информация', href: '/legal' }
	];

	// Функция для проверки активного пункта меню
	function isActive(href: string) {
		if (href === '/') return page.url.pathname === '/';
		return page.url.pathname.startsWith(href);
	}
</script>

<div class="home">
	<!-- Шапка сайта -->
	<header class="site-header">
		<div class="header-inner">
			<a href="/" class="logo">
				<span class="logo-icon">🚗</span>
				<span class="logo-text">Kids Informatics</span>
			</a>
			<nav class="header-nav">
				<a href="/car-play" class="btn-play desktop-play">▶ Играть</a>
				<button
					class="menu-toggle"
					type="button"
					aria-label={isMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
					aria-expanded={isMenuOpen}
					aria-controls="site-menu"
					onclick={() => (isMenuOpen = !isMenuOpen)}
				>
					<span></span>
					<span></span>
					<span></span>
				</button>
			</nav>
		</div>
	</header>

	{#if isMenuOpen}
		<button
			class="menu-backdrop"
			type="button"
			aria-label="Закрыть меню"
			onclick={() => (isMenuOpen = false)}
		></button>
	{/if}

	<!-- Обёртка с сайдбаром и основным контентом -->
	<div class="content-wrapper">
		<aside id="site-menu" class={`sidebar${isMenuOpen ? ' open' : ''}`}>
			<nav class="menu">
				{#each menuItems as item}
					<a
						href={item.href}
						class="menu-item"
						class:active={isActive(item.href)}
						onclick={() => (isMenuOpen = false)}
					>
						<span class="menu-icon">{item.icon}</span>
						<span class="menu-label">{item.label}</span>
					</a>
				{/each}
				<a href="/car-play" class="menu-item mobile-menu-play" onclick={() => (isMenuOpen = false)}>
					<span class="menu-icon">▶️</span>
					<span class="menu-label">Играть</span>
				</a>
			</nav>
		</aside>

		<!-- Сюда вставляется контент конкретной страницы -->
		<main class="main-content">
			{@render children()}
		</main>
	</div>

	<!-- Подвал -->
	<footer class="site-footer">
		<div class="footer-inner">
			<p class="footer-inner__right">© 2026 Kids Informatics. Все права защищены.</p>
			<div class="footer-links">
				<a href="/legal">Правовая информация</a>
				<a href="/parents">Родителям</a>
			</div>
		</div>
	</footer>
</div>
