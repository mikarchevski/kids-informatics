<script lang="ts">
	import type { LayoutData } from './$types';
	let { data, children } = $props();
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
			<a href="/manage/users" class="nav-item disabled" title="Раздел в разработке">
				<span class="icon"></span> Пользователи
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

<style>
	.admin-dashboard {
		display: flex;
		min-height: 100vh;
		background: #f4f6f8;
	}
	.sidebar {
		width: 260px;
		background: #2c3e50;
		color: white;
		display: flex;
		flex-direction: column;
		flex-shrink: 0;
	}
	.sidebar-header {
		padding: 1.5rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}
	.sidebar-header h2 {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 600;
	}
	.sidebar-nav {
		padding: 1rem 0;
		flex: 1;
	}
	.nav-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.875rem 1.5rem;
		color: #ecf0f1;
		text-decoration: none;
		transition:
			background 0.2s,
			color 0.2s;
		font-size: 0.95rem;
	}
	.nav-item:hover {
		background: rgba(255, 255, 255, 0.1);
		color: #fff;
	}
	.nav-item.disabled {
		opacity: 0.5;
		cursor: not-allowed;
		pointer-events: none;
	}
	.main-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}
	.top-bar {
		background: white;
		padding: 1rem 2rem;
		border-bottom: 1px solid #e2e8f0;
		display: flex;
		justify-content: flex-end;
		align-items: center;
	}
	.user-info {
		display: flex;
		align-items: center;
		gap: 1rem;
		font-size: 0.9rem;
		color: #4a5568;
	}
	.username {
		font-weight: 500;
	}
	.btn-logout {
		padding: 0.4rem 1rem;
		background: #e2e8f0;
		color: #4a5568;
		border-radius: 6px;
		text-decoration: none;
		font-weight: 500;
		transition: background 0.2s;
	}
	.btn-logout:hover {
		background: #cbd5e0;
	}
	.page-content {
		flex: 1;
		padding: 2rem;
		overflow-y: auto;
	}
</style>
