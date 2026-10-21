<script lang="ts">
	import type { LayoutData } from './$types';
	let { data, children } = $props();
	import './layout.css';
</script>

<svelte:head>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="admin-dashboard">
	<!-- Боковое меню -->
	<aside class="sidebar">
		<div class="sidebar-header">
			<h2>🚀 Kids Coder</h2>
		</div>
		<nav class="sidebar-nav">
			<a href="/manage/users" class="nav-item">
				<span class="icon">👥</span> Пользователи
			</a>
			<a href="/manage/articles" class="nav-item">
				<span class="icon">📝</span> Управление статьями
			</a>
		</nav>
	</aside>

	<!-- Основная область -->
	<main class="main-content">
		{@render children()}
	</main>
</div>
