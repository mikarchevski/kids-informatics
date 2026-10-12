<script lang="ts">
	let { class: className = '' } = $props();
</script>

<svg class={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
	<!-- Голова -->
	<ellipse cx="32" cy="36" rx="18" ry="16" fill="#F39C12" />
	<!-- Уши -->
	<path d="M18 24 L14 10 L26 18 Z" fill="#E67E22" />
	<path d="M46 24 L50 10 L38 18 Z" fill="#E67E22" />
	<!-- Внутренняя часть ушей -->
	<path d="M20 22 L17 14 L25 19 Z" fill="#FAD7A0" />
	<path d="M44 22 L47 14 L39 19 Z" fill="#FAD7A0" />
	<!-- Глаза -->
	<ellipse cx="26" cy="32" rx="3" ry="4" fill="#2C3E50" />
	<ellipse cx="38" cy="32" rx="3" ry="4" fill="#2C3E50" />
	<circle cx="25" cy="31" r="1" fill="white" />
	<circle cx="37" cy="31" r="1" fill="white" />
	<!-- Нос -->
	<path d="M30 38 L34 38 L32 41 Z" fill="#E74C3C" />
	<!-- Рот -->
	<path
		d="M32 41 Q30 43 28 42"
		stroke="#2C3E50"
		stroke-width="1.5"
		fill="none"
		stroke-linecap="round"
	/>
	<path
		d="M32 41 Q34 43 36 42"
		stroke="#2C3E50"
		stroke-width="1.5"
		fill="none"
		stroke-linecap="round"
	/>
	<!-- Усы -->
	<line x1="20" y1="38" x2="10" y2="36" stroke="#2C3E50" stroke-width="1" stroke-linecap="round" />
	<line x1="20" y1="40" x2="10" y2="42" stroke="#2C3E50" stroke-width="1" stroke-linecap="round" />
	<line x1="44" y1="38" x2="54" y2="36" stroke="#2C3E50" stroke-width="1" stroke-linecap="round" />
	<line x1="44" y1="40" x2="54" y2="42" stroke="#2C3E50" stroke-width="1" stroke-linecap="round" />
</svg>
