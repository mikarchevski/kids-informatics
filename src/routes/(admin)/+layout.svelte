<script lang="ts">
	import type { LayoutData } from './$types';
	let { data, children } = $props();
	import './layout.css';
</script>

<div class="admin-dashboard">
	<!-- Боковое меню -->
	<aside class="sidebar">
		<div class="sidebar-header">
			<h2>🚀 Kids Coder</h2>
		</div>
		<nav class="sidebar-nav">
			<a href="/manage/articles" class="nav-item">
				<span class="icon">📝</span> Управление статьями
			</a>
			<a href="/manage/users" class="nav-item">
				<span class="icon">👥</span> Пользователи
			</a>
		</nav>
	</aside>

	<!-- Основная область -->
	<main class="main-content">
		<!-- <header class="top-bar">
			<div class="user-info">
				<span class="username">Привет, {data.user?.username}!</span>
				<a href="/logout" class="btn-logout">Выйти</a>
			</div>
		</header> -->

		<div class="page-content">
			{@render children()}
		</div>
	</main>
</div>
