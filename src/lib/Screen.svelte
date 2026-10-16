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
	import './Screen.css';
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
						<div
							class="robot-orientation"
							class:direction-right={position.direction === 'right'}
							class:direction-down={position.direction === 'down'}
							class:direction-left={position.direction === 'left'}
						>
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

<style src="./Screen.css"></style>
