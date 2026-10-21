<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
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
		return () => {
			window.removeEventListener('resize', updateViewportHeight);
			window.removeEventListener('orientationchange', updateViewportHeight);
			window.visualViewport?.removeEventListener('resize', updateViewportHeight);
			document.documentElement.classList.remove('game-active');
			document.body.classList.remove('game-active');
			document.documentElement.style.removeProperty('--vh');
		};
	});
</script>

{@render children()}
<OrientationLock />

<style src="./layout.css"></style>
