<script lang="ts">
  let { class: className = '' } = $props();
</script>

<svg class={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Корпус машинки -->
  <rect x="8" y="24" width="48" height="20" rx="4" fill="#E74C3C"/>
  <!-- Крыша -->
  <path d="M16 24 L20 12 L44 12 L48 24 Z" fill="#C0392B"/>
  <!-- Окна -->
  <rect x="22" y="14" width="8" height="8" rx="1" fill="#AED6F1"/>
  <rect x="34" y="14" width="8" height="8" rx="1" fill="#AED6F1"/>
  <!-- Колёса -->
  <circle cx="18" cy="46" r="6" fill="#2C3E50"/>
  <circle cx="46" cy="46" r="6" fill="#2C3E50"/>
  <circle cx="18" cy="46" r="3" fill="#7F8C8D"/>
  <circle cx="46" cy="46" r="3" fill="#7F8C8D"/>
  <!-- Фары -->
  <circle cx="12" cy="32" r="2" fill="#F1C40F"/>
  <circle cx="52" cy="32" r="2" fill="#F1C40F"/>
</svg>