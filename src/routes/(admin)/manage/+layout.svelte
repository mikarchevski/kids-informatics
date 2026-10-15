<script lang="ts">
	import type { LayoutData } from './$types';
	let { data, children } = $props();
	import './layout.css';
</script>

<div class="admin-dashboard">
	<!-- Основная область -->
	<main class="main-content">
		<header class="top-bar">
			<div class="user-info">
				<!-- Кнопка на сайт -->
				<a href="/" target="_blank" class="btn-site" title="Открыть сайт"> На сайт </a>
				<!-- Приветствие -->
				<span class="username">Привет, {data.user?.username || 'Админ'}!</span>
				<a href="/logout" class="btn-logout">Выйти</a>
			</div>
		</header>

		<div class="page-content">
			{@render children()}
		</div>
	</main>
</div>

<style>
</style>
