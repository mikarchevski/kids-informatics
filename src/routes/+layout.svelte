<script lang="ts">
	import './app.css';
	import { onMount } from 'svelte';

	let { children } = $props();

	function updateViewportHeight() {
		const vh = window.innerHeight * 0.01;
		document.documentElement.style.setProperty('--vh', `${vh}px`);
	}

	onMount(() => {
		updateViewportHeight();
		window.addEventListener('resize', updateViewportHeight);
		window.addEventListener('orientationchange', updateViewportHeight);

		return () => {
			window.removeEventListener('resize', updateViewportHeight);
			window.removeEventListener('orientationchange', updateViewportHeight);
		};
	});
</script>

<div class="app-container">
	{@render children()}
</div>
