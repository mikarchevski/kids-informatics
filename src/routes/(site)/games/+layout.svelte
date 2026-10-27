<script lang="ts">
	import { page } from '$app/state';
	import './layout.css';

	const showBackButton = $derived(page.url.pathname.startsWith('/games/'));
</script>

<div class="games-layout">
	{#if showBackButton}
		<nav class="games-nav">
			<a href="/games" class="back-button" aria-label="Перейти ко всем играм">
				<span class="back-icon">⬅️</span>
				<span class="back-text">Ко всем играм</span>
			</a>
		</nav>
	{/if}

	<div class="games-content">
		<slot />
	</div>
</div>

<style>
</style>
