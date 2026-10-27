<script lang="ts">
	import { onMount } from 'svelte';
	import './page.css';

	type Difficulty = 'easy' | 'medium' | 'hard';
	type Position = { x: number; y: number };
	type Walls = { top: boolean; right: boolean; bottom: boolean; left: boolean };
	type Cell = Position & { walls: Walls };
	type Progress = {
		bestTimes: Record<Difficulty, number | null>;
		bestMoves: Record<Difficulty, number | null>;
		completedCount: Record<Difficulty, number>;
		selectedCharacter: string;
	};

	const sizes: Record<Difficulty, number> = { easy: 5, medium: 7, hard: 10 };
	const difficultyLabels: Record<Difficulty, string> = {
		easy: 'Легко',
		medium: 'Средне',
		hard: 'Сложно'
	};
	const characters = [
		{ emoji: '🐶', label: 'Собака' },
		{ emoji: '🐱', label: 'Кошка' },
		{ emoji: '🦊', label: 'Лиса' },
		{ emoji: '🐰', label: 'Кролик' },
		{ emoji: '🐻', label: 'Медведь' }
	];
	const storageKey = 'maze-progress';

	let difficulty = $state<Difficulty>('easy');
	let gridSize = $state(sizes.easy);
	let cells = $state<Cell[][]>([]);
	let player = $state<Position>({ x: 0, y: 0 });
	let finish = $derived<Position>({ x: gridSize - 1, y: gridSize - 1 });
	let selectedCharacter = $state('🐶');
	let isFinished = $state(false);
	let moves = $state(0);
	let elapsedTime = $state(0);
	let startTime = $state<number | null>(null);
	let bump = $state(false);
	let hintPath = $state<Position[]>([]);
	let hintVisible = $state(false);
	let isChanging = $state(false);
	let bestTimes = $state<Record<Difficulty, number | null>>({
		easy: null,
		medium: null,
		hard: null
	});
	let bestMoves = $state<Record<Difficulty, number | null>>({
		easy: null,
		medium: null,
		hard: null
	});
	let completedCount = $state<Record<Difficulty, number>>({ easy: 0, medium: 0, hard: 0 });
	let timerInterval: number | null = null;
	let bumpTimer: number | null = null;
	let hintTimer: number | null = null;
	let touchStartX = 0;
	let touchStartY = 0;

	function createEmptyGrid(size: number): Cell[][] {
		return Array.from({ length: size }, (_, y) =>
			Array.from({ length: size }, (_, x) => ({
				x,
				y,
				walls: { top: true, right: true, bottom: true, left: true }
			}))
		);
	}

	function generateMaze(size: number): Cell[][] {
		const grid = createEmptyGrid(size);
		const visited = new Set<string>();
		const stack: Position[] = [{ x: 0, y: 0 }];
		visited.add('0,0');
		const directions = [
			{ dx: 0, dy: -1, current: 'top', next: 'bottom' },
			{ dx: 1, dy: 0, current: 'right', next: 'left' },
			{ dx: 0, dy: 1, current: 'bottom', next: 'top' },
			{ dx: -1, dy: 0, current: 'left', next: 'right' }
		] as const;

		while (stack.length) {
			const current = stack[stack.length - 1];
			const available = directions
				.map((direction) => ({
					...direction,
					x: current.x + direction.dx,
					y: current.y + direction.dy
				}))
				.filter(
					({ x, y }) => x >= 0 && x < size && y >= 0 && y < size && !visited.has(`${x},${y}`)
				);

			if (!available.length) {
				stack.pop();
				continue;
			}

			const next = available[Math.floor(Math.random() * available.length)];
			grid[current.y][current.x].walls[next.current] = false;
			grid[next.y][next.x].walls[next.next] = false;
			visited.add(`${next.x},${next.y}`);
			stack.push({ x: next.x, y: next.y });
		}

		return grid;
	}

	function loadProgress() {
		try {
			const saved = JSON.parse(
				localStorage.getItem(storageKey) ?? 'null'
			) as Partial<Progress> | null;
			if (!saved) return;
			bestTimes = saved.bestTimes ?? bestTimes;
			bestMoves = saved.bestMoves ?? bestMoves;
			completedCount = saved.completedCount ?? completedCount;
			selectedCharacter = saved.selectedCharacter ?? selectedCharacter;
		} catch {
			localStorage.removeItem(storageKey);
		}
	}

	function saveProgress() {
		localStorage.setItem(
			storageKey,
			JSON.stringify({ bestTimes, bestMoves, completedCount, selectedCharacter } satisfies Progress)
		);
	}

	function startTimer() {
		if (startTime !== null) return;
		startTime = Date.now();
		timerInterval = window.setInterval(() => {
			if (startTime !== null) elapsedTime = Date.now() - startTime;
		}, 100);
	}

	function stopTimer() {
		if (timerInterval !== null) window.clearInterval(timerInterval);
		timerInterval = null;
	}

	function getNeighbors(position: Position): Position[] {
		const cell = cells[position.y]?.[position.x];
		if (!cell) return [];
		const result: Position[] = [];
		if (!cell.walls.top && position.y > 0) result.push({ x: position.x, y: position.y - 1 });
		if (!cell.walls.right && position.x < gridSize - 1)
			result.push({ x: position.x + 1, y: position.y });
		if (!cell.walls.bottom && position.y < gridSize - 1)
			result.push({ x: position.x, y: position.y + 1 });
		if (!cell.walls.left && position.x > 0) result.push({ x: position.x - 1, y: position.y });
		return result;
	}

	function findShortestPath(): Position[] {
		const queue: Position[][] = [[{ ...player }]];
		const visited = new Set<string>();
		while (queue.length) {
			const path = queue.shift()!;
			const current = path[path.length - 1];
			if (current.x === finish.x && current.y === finish.y) return path;
			const key = `${current.x},${current.y}`;
			if (visited.has(key)) continue;
			visited.add(key);
			for (const neighbor of getNeighbors(current)) {
				if (!visited.has(`${neighbor.x},${neighbor.y}`)) queue.push([...path, neighbor]);
			}
		}
		return [];
	}

	function showHint() {
		if (isFinished) return;
		hintPath = findShortestPath();
		hintVisible = true;
		if (hintTimer !== null) window.clearTimeout(hintTimer);
		hintTimer = window.setTimeout(() => {
			hintVisible = false;
			hintPath = [];
		}, 3000);
	}

	function isHintCell(x: number, y: number) {
		return hintVisible && hintPath.some((position) => position.x === x && position.y === y);
	}

	function playBump() {
		bump = true;
		if (bumpTimer !== null) window.clearTimeout(bumpTimer);
		bumpTimer = window.setTimeout(() => (bump = false), 300);
	}

	function tryMove(newX: number, newY: number) {
		if (isFinished) return;
		if (newX < 0 || newX >= gridSize || newY < 0 || newY >= gridSize) return playBump();
		const current = cells[player.y][player.x];
		const dx = newX - player.x;
		const dy = newY - player.y;
		if (
			(dx === 1 && current.walls.right) ||
			(dx === -1 && current.walls.left) ||
			(dy === 1 && current.walls.bottom) ||
			(dy === -1 && current.walls.top)
		)
			return playBump();
		startTimer();
		player = { x: newX, y: newY };
		moves++;
		if (newX === finish.x && newY === finish.y) {
			isFinished = true;
			elapsedTime = startTime ? Date.now() - startTime : 0;
			stopTimer();
			const time = bestTimes[difficulty];
			const count = completedCount[difficulty];
			bestTimes = {
				...bestTimes,
				[difficulty]: time === null ? elapsedTime : Math.min(time, elapsedTime)
			};
			bestMoves = {
				...bestMoves,
				[difficulty]:
					bestMoves[difficulty] === null ? moves : Math.min(bestMoves[difficulty]!, moves)
			};
			completedCount = { ...completedCount, [difficulty]: count + 1 };
			saveProgress();
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		const movesByKey: Record<string, Position> = {
			ArrowUp: { x: player.x, y: player.y - 1 },
			ArrowDown: { x: player.x, y: player.y + 1 },
			ArrowLeft: { x: player.x - 1, y: player.y },
			ArrowRight: { x: player.x + 1, y: player.y }
		};
		const next = movesByKey[event.key];
		if (!next) return;
		event.preventDefault();
		tryMove(next.x, next.y);
	}

	function handleTouchStart(event: TouchEvent) {
		touchStartX = event.touches[0].clientX;
		touchStartY = event.touches[0].clientY;
	}

	function handleTouchEnd(event: TouchEvent) {
		const dx = event.changedTouches[0].clientX - touchStartX;
		const dy = event.changedTouches[0].clientY - touchStartY;
		if (Math.max(Math.abs(dx), Math.abs(dy)) < 30) return;
		if (Math.abs(dx) > Math.abs(dy)) tryMove(player.x + (dx > 0 ? 1 : -1), player.y);
		else tryMove(player.x, player.y + (dy > 0 ? 1 : -1));
	}

	function newMaze(nextDifficulty = difficulty) {
		if (timerInterval !== null) stopTimer();
		difficulty = nextDifficulty;
		gridSize = sizes[nextDifficulty];
		cells = generateMaze(gridSize);
		player = { x: 0, y: 0 };
		isFinished = false;
		moves = 0;
		elapsedTime = 0;
		startTime = null;
		hintVisible = false;
		hintPath = [];
		isChanging = !isChanging;
	}

	function selectCharacter(emoji: string) {
		selectedCharacter = emoji;
		saveProgress();
	}

	function formatTime(milliseconds: number) {
		return `${Math.floor(milliseconds / 1000)}с`;
	}

	onMount(() => {
		loadProgress();
		newMaze('easy');
		return () => {
			stopTimer();
			if (bumpTimer !== null) window.clearTimeout(bumpTimer);
			if (hintTimer !== null) window.clearTimeout(hintTimer);
		};
	});
</script>

<svelte:head>
	<title>Лабиринт — Развивающая игра</title>
	<meta name="description" content="Проведи персонажа через лабиринт, избегая стен." />
</svelte:head>

<svelte:window onkeydown={handleKeydown} />

<div class="maze-game">
	<header class="game-heading">
		<div>
			<p class="eyebrow">Лабиринт</p>
			<h1>Проведи героя к финишу</h1>
		</div>
		<div class="score" aria-live="polite">Время: {formatTime(elapsedTime)}<br />Ходы: {moves}</div>
	</header>

	<div class="difficulty-tabs" aria-label="Выбор сложности">
		{#each Object.keys(sizes) as levelDifficulty}
			{@const key = levelDifficulty as Difficulty}
			<button class:active={difficulty === key} type="button" onclick={() => newMaze(key)}>
				{difficultyLabels[key]} · {sizes[key]}×{sizes[key]}
			</button>
		{/each}
	</div>

	<section class="character-picker" aria-label="Выбор персонажа">
		<span>Герой:</span>
		{#each characters as character}
			<button
				class:selected={selectedCharacter === character.emoji}
				type="button"
				aria-label={character.label}
				onclick={() => selectCharacter(character.emoji)}>{character.emoji}</button
			>
		{/each}
	</section>

	<main>
		<div
			class:small-grid={gridSize >= 10}
			class="maze-board"
			style={`--grid-size: ${gridSize}`}
			role="grid"
			tabindex="0"
			aria-label={`Лабиринт ${gridSize} на ${gridSize}`}
			ontouchstart={handleTouchStart}
			ontouchend={handleTouchEnd}
		>
			{#each cells.flat() as cell (cell.y * gridSize + cell.x)}
				<div
					class="maze-cell"
					class:hint-cell={isHintCell(cell.x, cell.y)}
					class:player-cell={player.x === cell.x && player.y === cell.y}
					role="gridcell"
					aria-label={`Клетка ${cell.x + 1}, ${cell.y + 1}`}
					style={`border-top-color: ${cell.walls.top ? '#334155' : 'transparent'}; border-right-color: ${cell.walls.right ? '#334155' : 'transparent'}; border-bottom-color: ${cell.walls.bottom ? '#334155' : 'transparent'}; border-left-color: ${cell.walls.left ? '#334155' : 'transparent'}`}
				>
					{#if player.x === cell.x && player.y === cell.y}<span
							class="player"
							class:bump-player={bump}
							aria-label="Персонаж">{selectedCharacter}</span
						>{/if}
					{#if finish.x === cell.x && finish.y === cell.y}<span class="finish" aria-label="Финиш"
							>🏁</span
						>{/if}
				</div>
			{/each}
		</div>

		<div class="controls" aria-label="Управление персонажем">
			<button type="button" aria-label="Вверх" onclick={() => tryMove(player.x, player.y - 1)}
				>↑</button
			>
			<div>
				<button type="button" aria-label="Влево" onclick={() => tryMove(player.x - 1, player.y)}
					>←</button
				><button type="button" aria-label="Вниз" onclick={() => tryMove(player.x, player.y + 1)}
					>↓</button
				><button type="button" aria-label="Вправо" onclick={() => tryMove(player.x + 1, player.y)}
					>→</button
				>
			</div>
		</div>

		<div class="actions">
			<button type="button" onclick={() => newMaze()}>🔄 Новый лабиринт</button>
			<button type="button" onclick={showHint}>💡 Подсказка</button>
		</div>
	</main>

	{#if isFinished}
		<div class="win-overlay">
			<div class="win-card" role="dialog" aria-modal="true" aria-labelledby="win-title">
				<div class="celebration" aria-hidden="true">🎉 ✨ 🎊</div>
				<h2 id="win-title">Победа!</h2>
				<p>Ты прошёл лабиринт за {formatTime(elapsedTime)} и {moves} ходов.</p>
				<p class="records">
					Лучшее время: {formatTime(bestTimes[difficulty] ?? elapsedTime)}<br />Лучшие ходы: {bestMoves[
						difficulty
					] ?? moves}
				</p>
				<div class="win-actions">
					<button type="button" onclick={() => newMaze()}>Следующий уровень</button><button
						type="button"
						onclick={() => newMaze()}>🔄 Новый лабиринт</button
					>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
</style>
