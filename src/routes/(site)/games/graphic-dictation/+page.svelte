<script lang="ts">
	import './page.css';
	import { onMount } from 'svelte';
	import {
		buildDictationEdges,
		type DictationDirection,
		type DictationPathStep
	} from '#lib/dictation-path';

	type Direction = DictationDirection;

	interface Command {
		direction: Direction;
		steps: number;
	}

	interface Level {
		id: string;
		name: string;
		emoji: string;
		gridSize: number;
		startPos: { x: number; y: number };
		commands: Command[];
		description: string;
	}

	// Дефолтные уровни (обновлены под рёберную логику)
	const defaultLevels: Level[] = [];

	// Состояние игры
	let levels = $state<Level[]>(defaultLevels);
	let currentLevel = $state<Level>(levels[0]);
	let position = $state<{ x: number; y: number }>({ x: 0, y: 0 });

	// НОВОЕ: храним нарисованные рёбра вместо закрашенных клеток
	let drawnEdges = $state<Set<string>>(new Set());
	let drawnPath = $state<DictationPathStep[]>([]);

	let currentCommandIndex = $state(0);
	let currentStepInCommand = $state(0);
	let isAutoPlaying = $state(false);
	let isCompleted = $state(false);
	let lastError = $state<string | null>(null);
	let autoPlayTimeout: number | null = null;

	// Инициализация уровня
	function loadLevel(level: Level) {
		currentLevel = level;
		position = { ...level.startPos };
		drawnEdges = new Set();
		drawnPath = [];
		currentCommandIndex = 0;
		currentStepInCommand = 0;
		isCompleted = false;
		lastError = null;
		stopAutoPlay();
	}

	// Выполнить один шаг — рисуем ребро
	function executeStepV2() {
		if (isCompleted || !currentLevel) return;
		if (currentCommandIndex >= currentLevel.commands.length) {
			isCompleted = true;
			stopAutoPlay();
			return;
		}

		const command = currentLevel.commands[currentCommandIndex];

		let newX = position.x;
		let newY = position.y;

		switch (command.direction) {
			case 'up':
				newY = position.y - 1;
				break;
			case 'down':
				newY = position.y + 1;
				break;
			case 'left':
				newX = position.x - 1;
				break;
			case 'right':
				newX = position.x + 1;
				break;
		}

		// Проверка границ
		if (newX < 0 || newX >= currentLevel.gridSize || newY < 0 || newY >= currentLevel.gridSize) {
			lastError = `️ Нельзя выйти за пределы поля! Попробуй другую команду.`;
			setTimeout(() => {
				lastError = null;
			}, 2000);
			stopAutoPlay();
			return;
		}

		drawnPath = [...drawnPath, { x: position.x, y: position.y, direction: command.direction }];
		drawnEdges = buildDictationEdges(drawnPath);

		position = { x: newX, y: newY };
		currentStepInCommand++;
		lastError = null;

		if (currentStepInCommand >= command.steps) {
			currentStepInCommand = 0;
			currentCommandIndex++;

			if (currentCommandIndex >= currentLevel.commands.length) {
				isCompleted = true;
				stopAutoPlay();
			}
		}
	}

	// Ручное управление
	function handleDirectionClick(direction: Direction) {
		if (isCompleted || !currentLevel) return;

		const currentCommand = currentLevel.commands[currentCommandIndex];
		if (!currentCommand) return;

		if (currentCommand.direction === direction) {
			executeStepV2();
		} else {
			lastError = `⚠️ Нужно идти ${currentCommand.direction === 'up' ? 'вверх' : currentCommand.direction === 'down' ? 'вниз' : currentCommand.direction === 'left' ? 'влево' : 'вправо'}!`;
			setTimeout(() => {
				lastError = null;
			}, 1500);
		}
	}

	// Автоматическое выполнение
	function startAutoPlay() {
		if (isCompleted || isAutoPlaying || !currentLevel) return;
		isAutoPlaying = true;

		const tick = () => {
			if (!isAutoPlaying || isCompleted) return;
			executeStepV2();
			if (!isCompleted) {
				autoPlayTimeout = window.setTimeout(tick, 400);
			}
		};
		tick();
	}

	function stopAutoPlay() {
		isAutoPlaying = false;
		if (autoPlayTimeout) {
			clearTimeout(autoPlayTimeout);
			autoPlayTimeout = null;
		}
	}

	function resetLevel() {
		if (currentLevel) {
			stopAutoPlay();
			loadLevel(currentLevel);
		}
	}

	// Обработка клавиатуры
	function handleKeydown(event: KeyboardEvent) {
		if (isAutoPlaying) return;

		switch (event.key) {
			case 'ArrowUp':
				event.preventDefault();
				handleDirectionClick('up');
				break;
			case 'ArrowDown':
				event.preventDefault();
				handleDirectionClick('down');
				break;
			case 'ArrowLeft':
				event.preventDefault();
				handleDirectionClick('left');
				break;
			case 'ArrowRight':
				event.preventDefault();
				handleDirectionClick('right');
				break;
		}
	}

	// Загрузка при старте
	onMount(async () => {
		try {
			const response = await fetch('/api/admin/dictation-levels');
			if (response.ok) {
				const dbLevels = await response.json();
				if (dbLevels && dbLevels.length > 0) {
					levels = dbLevels.map((l: any) => ({
						id: l.id,
						name: l.name,
						emoji: l.emoji,
						gridSize: l.gridSize,
						startPos: { x: l.startX || 0, y: l.startY || 0 },
						commands: l.commands,
						description: l.description || ''
					}));
				}
			}
		} catch (error) {
			console.log('API недоступен, используем встроенные уровни');
		}

		loadLevel(levels[0]);
	});
</script>

<svelte:head>
	<title>Графический диктант — Рисуй по клеточкам</title>
	<meta
		name="description"
		content="Графический диктант онлайн: рисуй по клеточкам, слушая команды. Развивает пространственное мышление, внимание и подготовку руки к письму."
	/>
</svelte:head>

<svelte:window onkeydown={handleKeydown} />

<div class="dictation-game">
	<header class="game-header">
		<h1>✏️ Графический диктант</h1>
		<p class="subtitle">Рисуй по клеточкам, выполняя команды</p>
	</header>

	<div class="game-layout">
		<!-- Левая панель: выбор фигур -->
		<aside class="level-selector" aria-label="Выбор уровня">
			<h3>🎨 Выбери фигуру:</h3>
			<div class="levels-grid">
				{#each levels as level (level.id)}
					<button
						class="level-card"
						class:active={currentLevel && currentLevel.id === level.id}
						onclick={() => loadLevel(level)}
					>
						<span class="level-emoji">{level.emoji}</span>
						<span class="level-name">{level.name}</span>
					</button>
				{/each}
			</div>
		</aside>

		<!-- Правая часть: поле и управление -->
		<main class="game-area">
			<!-- Текущая команда -->
			<section class="current-command" aria-label="Текущая команда">
				{#if lastError}
					<div class="error-message" role="alert">
						{lastError}
					</div>
				{/if}

				{#if currentLevel && !isCompleted && currentCommandIndex < currentLevel.commands.length}
					{@const cmd = currentLevel.commands[currentCommandIndex]}
					<div class="command-display">
						<span class="command-arrow">
							{cmd.direction === 'up'
								? '⬆️'
								: cmd.direction === 'down'
									? '⬇️'
									: cmd.direction === 'left'
										? '⬅️'
										: '️'}
						</span>
						<span class="command-text">
							{cmd.steps}
							{cmd.steps === 1 ? 'клетка' : cmd.steps < 5 ? 'клетки' : 'клеток'}
							{cmd.direction === 'up'
								? 'вверх'
								: cmd.direction === 'down'
									? 'вниз'
									: cmd.direction === 'left'
										? 'влево'
										: 'вправо'}
						</span>
						<span class="command-progress">
							({currentStepInCommand}/{cmd.steps})
						</span>
					</div>
				{:else if currentLevel && isCompleted}
					<div class="command-display completed">
						<span class="command-arrow">🎉</span>
						<span class="command-text">Фигура готова!</span>
					</div>
				{/if}
			</section>

			<!-- Игровое поле -->
			<section class="game-board" aria-label="Игровое поле">
				{#if currentLevel}
					<div class="grid" style="grid-template-columns: repeat({currentLevel.gridSize}, 1fr);">
						{#each Array(currentLevel.gridSize * currentLevel.gridSize) as _, index}
							{@const x = index % currentLevel.gridSize}
							{@const y = Math.floor(index / currentLevel.gridSize)}
							{@const isCurrent = position.x === x && position.y === y}

							<div
								class="cell"
								class:edge-bottom={drawnEdges.has(`${x},${y},bottom`)}
								class:edge-left={drawnEdges.has(`${x},${y},left`)}
								class:edge-right={drawnEdges.has(`${x},${y},right`)}
								class:current={isCurrent}
							>
								{#if isCurrent}
									<span class="cursor">★</span>
								{/if}
							</div>
						{/each}
					</div>
				{/if}
			</section>

			<!-- Управление -->
			<section class="controls" aria-label="Управление">
				<div class="direction-pad">
					<button
						class="dir-button up"
						onclick={() => handleDirectionClick('up')}
						disabled={isAutoPlaying || isCompleted}
						aria-label="Вверх"
					>
						⬆️
					</button>
					<button
						class="dir-button left"
						onclick={() => handleDirectionClick('left')}
						disabled={isAutoPlaying || isCompleted}
						aria-label="Влево"
					>
						⬅️
					</button>
					<button class="dir-button center" onclick={resetLevel} aria-label="Сбросить"> 🔄 </button>
					<button
						class="dir-button right"
						onclick={() => handleDirectionClick('right')}
						disabled={isAutoPlaying || isCompleted}
						aria-label="Вправо"
					>
						➡️
					</button>
					<button
						class="dir-button down"
						onclick={() => handleDirectionClick('down')}
						disabled={isAutoPlaying || isCompleted}
						aria-label="Вниз"
					>
						⬇️️
					</button>
				</div>

				<div class="action-buttons">
					{#if isAutoPlaying}
						<button class="action-button stop" onclick={stopAutoPlay}> ⏸️ Остановить </button>
					{:else}
						<button class="action-button auto" onclick={startAutoPlay} disabled={isCompleted}>
							▶️ Показать как надо
						</button>
					{/if}
				</div>
			</section>
		</main>
	</div>

	<!-- Инструкции -->
	<section class="instructions">
		<h3>📖 Как играть</h3>
		<ol>
			<li>Выбери фигуру, которую хочешь нарисовать</li>
			<li>Смотри на команду: сколько клеток и в какую сторону</li>
			<li>Нажимай стрелки на экране или на клавиатуре</li>
			<li>Если ошибёшься — фигура не получится, попробуй снова!</li>
		</ol>
		<p class="tip">
			💡 <strong>Совет родителям:</strong> Сначала прочитайте команду вслух, пусть ребёнок выполнит её.
			Постепенно увеличивайте сложность.
		</p>
	</section>
</div>

<style>
</style>
