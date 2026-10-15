<script lang="ts">
	import Car from '#lib/avatars/Car.svelte';

	let {
		position,
		batteries = [],
		avatarComponent = Car,
		gridSize = 10
	}: {
		position: { x: number; y: number; direction: string };
		batteries?: { x: number; y: number }[];
		avatarComponent?: any;
		gridSize?: number;
	} = $props();

	const Avatar = $derived(avatarComponent);

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

<div class="scene-board">
	<div class="scene-grid" style:--grid-size={gridSize}>
		<div class="grid-cell grid-heading">X/Y</div>
		{#each Array(gridSize) as _, col}
			<div class="grid-cell grid-heading">{col + 1}</div>
		{/each}

		{#each Array(gridSize) as _, row}
			<div class="grid-cell grid-heading">{row + 1}</div>
			{#each Array(gridSize) as _, col}
				<div class="grid-cell" class:robot-cell={position.x === col && position.y === row}>
					{#if position.x === col && position.y === row}
						<div class="robot-orientation" style="transform: rotate({rotation}deg);">
							<div class="avatar-icon"><Avatar /></div>
						</div>
					{:else if getBatteryAt(col, row)}
						<span class="star-icon" aria-label="Звезда">⭐</span>
					{/if}
				</div>
			{/each}
		{/each}
	</div>
</div>

<style>
	.scene-board {
		display: grid;
		width: 100%;
		height: 100%;
		min-width: 0;
		min-height: 0;
		place-items: center;
	}

	.scene-grid {
		display: grid;
		width: min(100%, 400px);
		max-height: 100%;
		aspect-ratio: 1;
		grid-template-columns: 8% repeat(var(--grid-size), minmax(0, 1fr));
		grid-template-rows: 8% repeat(var(--grid-size), minmax(0, 1fr));
		gap: 2px;
		padding: 2px;
		overflow: hidden;
		border-radius: 10px;
		background: #cbd5e1;
	}

	.grid-cell {
		display: flex;
		min-width: 0;
		min-height: 0;
		align-items: center;
		justify-content: center;
		background: white;
		color: #334155;
		font-size: clamp(0.625rem, 2.5vw, 0.875rem);
		font-weight: 600;
	}

	.grid-heading {
		background: #f1f5f9;
		font-size: clamp(0.625rem, 2vw, 0.75rem);
	}

	.robot-cell {
		border: 2px solid #f59e0b;
		background: #fef3c7;
	}

	.robot-orientation {
		display: grid;
		width: 100%;
		height: 100%;
		place-items: center;
		transition: transform 0.2s ease-out;
	}

	.avatar-icon {
		display: grid;
		width: min(80%, 40px);
		height: min(80%, 40px);
		place-items: center;
	}

	.avatar-icon :global(svg) {
		width: 100%;
		height: 100%;
	}

	.star-icon {
		font-size: clamp(0.75rem, 3vw, 1.25rem);
	}

	@media (max-width: 900px) and (pointer: coarse) {
		.scene-grid {
			width: min(100%, 400px);
		}
	}
</style>
