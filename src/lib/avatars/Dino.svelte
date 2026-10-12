<script lang="ts">
	let { class: className = '' } = $props();
</script>

<svg class={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
	<!-- Тело -->
	<ellipse cx="32" cy="40" rx="16" ry="14" fill="#27AE60" />
	<!-- Голова -->
	<ellipse cx="32" cy="24" rx="12" ry="10" fill="#2ECC71" />
	<!-- Глаза -->
	<circle cx="28" cy="22" r="3" fill="white" />
	<circle cx="36" cy="22" r="3" fill="white" />
	<circle cx="27" cy="21" r="1.5" fill="#2C3E50" />
	<circle cx="35" cy="21" r="1.5" fill="#2C3E50" />
	<!-- Рот -->
	<path
		d="M28 28 Q32 30 36 28"
		stroke="#2C3E50"
		stroke-width="1.5"
		fill="none"
		stroke-linecap="round"
	/>
	<!-- Шипы на спине -->
	<path d="M20 32 L22 28 L24 32 Z" fill="#229954" />
	<path d="M28 30 L30 26 L32 30 Z" fill="#229954" />
	<path d="M36 30 L38 26 L40 30 Z" fill="#229954" />
	<!-- Хвост -->
	<path d="M48 40 Q54 38 56 42 Q54 44 48 44 Z" fill="#27AE60" />
	<!-- Лапы -->
	<ellipse cx="24" cy="52" rx="4" ry="3" fill="#229954" />
	<ellipse cx="40" cy="52" rx="4" ry="3" fill="#229954" />
</svg>
