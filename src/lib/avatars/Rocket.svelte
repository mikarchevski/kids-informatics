<script lang="ts">
	let { class: className = '' } = $props();
</script>

<svg class={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
	<!-- Корпус ракеты -->
	<path d="M32 4 L32 44 L24 52 L40 52 Z" fill="#ECF0F1" />
	<!-- Нос ракеты -->
	<path d="M32 4 L32 20 L24 28 L40 28 Z" fill="#E74C3C" />
	<!-- Иллюминатор -->
	<circle cx="32" cy="32" r="6" fill="#3498DB" />
	<circle cx="32" cy="32" r="4" fill="#AED6F1" />
	<!-- Крылья -->
	<path d="M24 44 L16 52 L24 52 Z" fill="#E74C3C" />
	<path d="M40 44 L48 52 L40 52 Z" fill="#E74C3C" />
	<!-- Огонь -->
	<path d="M28 52 L32 62 L36 52 Z" fill="#F39C12" />
	<path d="M30 52 L32 58 L34 52 Z" fill="#F1C40F" />
</svg>
