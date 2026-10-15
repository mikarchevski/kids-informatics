<script lang="ts">
	import type { LayoutData } from './$types';
	let { data, children } = $props();
	import './layout.css';
</script>

<header class="top-bar">
	<div class="user-info">
		<a href="/" target="_blank" class="btn-site" title="Открыть сайт"> На сайт </a>
		<span class="username">Привет, {data.user?.username || 'Админ'}!</span>
		<a href="/logout" class="btn-logout">Выйти</a>
	</div>
</header>

<div class="page-content">
	{@render children()}
</div>

<style>
</style>
