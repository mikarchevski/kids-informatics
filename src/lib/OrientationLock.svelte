<script lang="ts">
	import { onMount } from 'svelte';

	let isVisible = $state(false);

	onMount(() => {
		const portraitQuery = window.matchMedia('(orientation: portrait)');
		const mobileQuery = window.matchMedia('(pointer: coarse)');
		const previousBodyOverflow = document.body.style.overflow;
		const previousDocumentOverflow = document.documentElement.style.overflow;

		function updateVisibility() {
			isVisible = portraitQuery.matches && mobileQuery.matches;
			const overflow = isVisible ? 'hidden' : '';
			document.body.style.overflow = overflow || previousBodyOverflow;
			document.documentElement.style.overflow = overflow || previousDocumentOverflow;
		}

		updateVisibility();
		portraitQuery.addEventListener('change', updateVisibility);
		mobileQuery.addEventListener('change', updateVisibility);

		return () => {
			portraitQuery.removeEventListener('change', updateVisibility);
			mobileQuery.removeEventListener('change', updateVisibility);
			document.body.style.overflow = previousBodyOverflow;
			document.documentElement.style.overflow = previousDocumentOverflow;
		};
	});
</script>

{#if isVisible}
	<div class="orientation-lock" role="status" aria-live="polite">
		<svg
			class="phone-icon"
			xmlns="http://www.w3.org/2000/svg"
			width="80"
			height="136"
			viewBox="0 0 80 136"
			fill="none"
			aria-hidden="true"
		>
			<rect x="5" y="3" width="70" height="130" rx="12" stroke="currentColor" stroke-width="6" />
			<line
				x1="31"
				y1="15"
				x2="49"
				y2="15"
				stroke="currentColor"
				stroke-width="4"
				stroke-linecap="round"
			/>
			<circle cx="40" cy="120" r="4" fill="currentColor" />
		</svg>
		<p>Пожалуйста, поверните устройство горизонтально</p>
	</div>
{/if}

<style src="./OrientationLock.css"></style>
