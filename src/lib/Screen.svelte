<script lang="ts">
	import Car from '#lib/avatars/Car.svelte';

	let {
		position,
		batteries = [],
		score = 0,
		onAddBattery = () => {},
		avatarComponent = Car
	}: {
		position: { x: number; y: number; direction: string };
		batteries?: { x: number; y: number }[];
		score?: number;
		onAddBattery?: () => void;
		avatarComponent?: any;
	} = $props();

	const GRID_SIZE = 10;

	function getBatteryAt(x: number, y: number) {
		return batteries.some((b) => b.x === x && b.y === y);
	}

	const rotation = $derived(
		position.direction === 'right'
			? 0
			: position.direction === 'down'
				? 90
				: position.direction === 'left'
					? 180
					: 270
	);
</script>

<div class="screen">
	<div class="grid">
		<!-- Заголовок "X/Y" и заголовки столбцов -->
		<div class="cell header">X/Y</div>
		{#each Array(GRID_SIZE) as _, col}
			<div class="cell header">{col + 1}</div>
		{/each}

		<!-- Строки с заголовками и ячейками -->
		{#each Array(GRID_SIZE) as _, row}
			<div class="cell header">{row + 1}</div>
			{#each Array(GRID_SIZE) as _, col}
				<div class="cell" class:robot={position.x === col && position.y === row}>
					{#if position.x === col && position.y === row}
						<svelte:component
							this={avatarComponent}
							class="robot-svg"
							style="transform: rotate({rotation}deg);"
						/>
					{:else if getBatteryAt(col, row)}
						<span class="fuel-icon">🌟</span>
					{/if}
				</div>
			{/each}
		{/each}
	</div>

	<div class="controls">
		<button class="btn btn-success" onclick={onAddBattery}> 🌟 Добавить звезду </button>
		<div class="score">🌟 Счёт: {score}</div>
	</div>
</div>
