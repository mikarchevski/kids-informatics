<script lang="ts">
	import '../app.css';
	import { onDestroy, onMount } from 'svelte';
	import OrientationLock from '#lib/OrientationLock.svelte';

	let { children } = $props();

	function updateViewportHeight() {
		const viewportHeight = window.innerHeight * 0.01;
		document.documentElement.style.setProperty('--vh', `${viewportHeight}px`);
	}

	onMount(() => {
		updateViewportHeight();
		document.documentElement.classList.add('game-active');
		document.body.classList.add('game-active');
		window.addEventListener('resize', updateViewportHeight);
		window.addEventListener('orientationchange', updateViewportHeight);
		window.visualViewport?.addEventListener('resize', updateViewportHeight);
	});

	onDestroy(() => {
		window.removeEventListener('resize', updateViewportHeight);
		window.removeEventListener('orientationchange', updateViewportHeight);
		window.visualViewport?.removeEventListener('resize', updateViewportHeight);
		document.documentElement.classList.remove('game-active');
		document.body.classList.remove('game-active');
		document.documentElement.style.removeProperty('--vh');
	});
</script>

{@render children()}
<OrientationLock />

<style>
	@media (max-width: 900px) and (pointer: coarse) {
		:global(html.game-active),
		:global(body.game-active) {
			position: static;
			width: 100%;
			min-height: 100%;
			height: auto;
			overflow-x: clip;
			touch-action: pan-y pinch-zoom;
			-webkit-user-select: none;
			user-select: none;
		}
	}
</style>
