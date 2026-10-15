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

<style>
	.orientation-lock {
		position: fixed;
		z-index: 2147483647;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 2rem;
		padding: 2rem;
		background: #1a202c;
		color: #fff;
		text-align: center;
		touch-action: none;
	}

	.phone-icon {
		width: 5rem;
		height: auto;
		animation: rotate-phone 1.8s ease-in-out infinite alternate;
	}

	p {
		max-width: 24rem;
		margin: 0;
		font-size: clamp(1.25rem, 5vw, 1.75rem);
		font-weight: 600;
		line-height: 1.4;
	}

	@keyframes rotate-phone {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(90deg);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.phone-icon {
			animation: none;
			transform: rotate(90deg);
		}
	}
</style>
