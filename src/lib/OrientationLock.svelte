<script lang="ts">
	import { onMount } from 'svelte';

	let isVisible = $state(false);

	onMount(() => {
		const portraitQuery = window.matchMedia('(orientation: portrait)');
		const mobileQuery = window.matchMedia('(max-width: 900px)');
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
		<div class="orientation-graphic" aria-hidden="true">
			<svg
				class="rotation-arrows"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 160 160"
				fill="none"
			>
				<path d="M52 24a58 58 0 0 1 72 26" />
				<path d="m121 37 5 14-15 1" />
				<path d="M108 136a58 58 0 0 1-72-26" />
				<path d="m39 123-5-14 15-1" />
			</svg>
			<svg
				class="phone-icon"
				xmlns="http://www.w3.org/2000/svg"
				width="80"
				height="136"
				viewBox="0 0 80 136"
				fill="none"
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
		</div>
		<p>Поверните телефон горизонтально</p>
	</div>
{/if}

<style src="./OrientationLock.css"></style>
