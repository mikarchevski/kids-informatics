<script lang="ts">
	let { class: className = '' } = $props();
</script>

<svg class={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
	<!-- Антенна -->
	<line x1="32" y1="8" x2="32" y2="16" stroke="#7F8C8D" stroke-width="2" />
	<circle cx="32" cy="6" r="3" fill="#E74C3C" />
	<!-- Голова -->
	<rect x="16" y="16" width="32" height="24" rx="4" fill="#95A5A6" />
	<!-- Глаза -->
	<circle cx="24" cy="26" r="4" fill="#3498DB" />
	<circle cx="40" cy="26" r="4" fill="#3498DB" />
	<circle cx="23" cy="25" r="1.5" fill="white" />
	<circle cx="39" cy="25" r="1.5" fill="white" />
	<!-- Рот -->
	<rect x="22" y="34" width="20" height="3" rx="1" fill="#2C3E50" />
	<!-- Тело -->
	<rect x="20" y="42" width="24" height="16" rx="2" fill="#7F8C8D" />
	<!-- Кнопки на теле -->
	<circle cx="28" cy="48" r="2" fill="#2ECC71" />
	<circle cx="36" cy="48" r="2" fill="#F1C40F" />
	<circle cx="28" cy="54" r="2" fill="#E74C3C" />
	<circle cx="36" cy="54" r="2" fill="#3498DB" />
</svg>
