<script lang="ts">
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
	const defaultLevels: Level[] = [
		{
			id: 'square',
			name: 'Квадрат',
			emoji: '⬜',
			gridSize: 5,
			startPos: { x: 1, y: 1 },
			commands: [
				{ direction: 'right', steps: 3 },
				{ direction: 'down', steps: 3 },
				{ direction: 'left', steps: 3 },
				{ direction: 'up', steps: 3 }
			],
			description: 'Простая фигура для старта'
		},
		{
			id: 'letter-p',
			name: 'Буква П',
			emoji: 'П',
			gridSize: 5,
			startPos: { x: 1, y: 4 },
			commands: [
				{ direction: 'up', steps: 3 },
				{ direction: 'right', steps: 2 },
				{ direction: 'down', steps: 3 }
			],
			description: 'Учимся рисовать буквы'
		},
		{
			id: 'house',
			name: 'Домик',
			emoji: '🏠',
			gridSize: 7,
			startPos: { x: 1, y: 5 },
			commands: [
				{ direction: 'right', steps: 5 },
				{ direction: 'up', steps: 3 },
				{ direction: 'left', steps: 1 },
				{ direction: 'up', steps: 1 },
				{ direction: 'left', steps: 1 },
				{ direction: 'down', steps: 1 },
				{ direction: 'left', steps: 1 },
				{ direction: 'down', steps: 3 }
			],
			description: 'Домик с треугольной крышей'
		}
	];

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
	.dictation-game {
		max-width: 1400px;
		margin: 0 auto;
		padding: 1rem;
	}

	.game-header {
		text-align: center;
		margin-bottom: 1.5rem;
	}

	.game-header h1 {
		font-size: 2rem;
		margin-bottom: 0.25rem;
		color: #2d3748;
	}

	.subtitle {
		font-size: 1rem;
		color: #718096;
	}

	/* Основной layout: две колонки */
	.game-layout {
		display: grid;
		grid-template-columns: 280px 1fr;
		gap: 2rem;
		align-items: start;
	}

	/* Левая панель: выбор фигур */
	.level-selector {
		background: white;
		padding: 1.5rem;
		border-radius: 16px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
	}

	.level-selector h3 {
		margin-bottom: 1rem;
		color: #2d3748;
		font-size: 1.1rem;
	}

	.levels-grid {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.level-card {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		border: 2px solid #e2e8f0;
		border-radius: 12px;
		background: white;
		cursor: pointer;
		transition: all 0.2s;
		width: 100%;
		text-align: left;
	}

	.level-card:hover {
		border-color: #4299e1;
		background: #ebf8ff;
		transform: translateX(4px);
	}

	.level-card.active {
		border-color: #4299e1;
		background: #ebf8ff;
		box-shadow: 0 2px 4px rgba(66, 153, 225, 0.2);
	}

	.level-emoji {
		font-size: 1.5rem;
	}

	.level-name {
		font-size: 0.95rem;
		font-weight: 600;
		color: #4a5568;
	}

	/* Правая часть: поле и управление */
	.game-area {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	/* Текущая команда */
	.current-command {
		margin-bottom: 0;
	}

	.command-display {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		padding: 1rem 1.5rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border-radius: 12px;
		font-size: 1.25rem;
		font-weight: 700;
	}

	.command-display.completed {
		background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
	}

	.command-arrow {
		font-size: 2rem;
	}

	.command-progress {
		font-size: 0.9rem;
		opacity: 0.8;
	}

	/* Игровое поле */
	.game-board {
		display: flex;
		justify-content: center;
	}

	.grid {
		display: grid;
		gap: 2px;
		max-width: 500px;
		width: 100%;
		aspect-ratio: 1;
		background: #cbd5e0;
		padding: 2px;
		border-radius: 8px;
	}

	.cell {
		aspect-ratio: 1;
		background: white;
		border: 1px solid #e2e8f0;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background 0.2s;
		position: relative;
	}

	/* Рёбра, которые уже нарисованы */
	.cell.edge-bottom {
		border-bottom: 4px solid #4299e1;
	}
	.cell.edge-left {
		border-left: 4px solid #4299e1;
	}
	.cell.edge-right {
		border-right: 4px solid #4299e1;
	}

	.cell.current {
		background: #f6e05e;
	}

	.cursor {
		font-size: 1.5rem;
		color: #2d3748;
	}

	/* Управление */
	.controls {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 2rem;
		padding: 1rem;
		background: white;
		border-radius: 16px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
	}

	.direction-pad {
		display: grid;
		grid-template-columns: repeat(3, 60px);
		grid-template-rows: repeat(3, 60px);
		gap: 0.5rem;
	}

	.dir-button {
		width: 60px;
		height: 60px;
		border: 2px solid #e2e8f0;
		border-radius: 12px;
		background: white;
		font-size: 1.5rem;
		cursor: pointer;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.dir-button:hover:not(:disabled) {
		border-color: #4299e1;
		background: #ebf8ff;
		transform: scale(1.05);
	}

	.dir-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.dir-button.up {
		grid-column: 2;
		grid-row: 1;
	}
	.dir-button.left {
		grid-column: 1;
		grid-row: 2;
	}
	.dir-button.center {
		grid-column: 2;
		grid-row: 2;
		background: #f7fafc;
		font-size: 1.25rem;
	}
	.dir-button.right {
		grid-column: 3;
		grid-row: 2;
	}
	.dir-button.down {
		grid-column: 2;
		grid-row: 3;
	}

	.action-buttons {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.action-button {
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 8px;
		font-size: 0.95rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		white-space: nowrap;
	}

	.action-button.auto {
		background: #48bb78;
		color: white;
	}

	.action-button.auto:hover:not(:disabled) {
		background: #38a169;
	}

	.action-button.stop {
		background: #f56565;
		color: white;
	}

	.action-button.stop:hover {
		background: #c53030;
	}

	.action-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* Инструкции */
	.instructions {
		background: #f7fafc;
		padding: 1.5rem;
		border-radius: 12px;
		margin-top: 2rem;
	}

	.instructions h3 {
		margin-bottom: 1rem;
		color: #2d3748;
	}

	.instructions ol {
		margin-left: 1.5rem;
		margin-bottom: 1rem;
	}

	.instructions li {
		margin-bottom: 0.5rem;
		color: #4a5568;
	}

	.tip {
		background: #ebf8ff;
		padding: 1rem;
		border-radius: 8px;
		border-left: 4px solid #4299e1;
		color: #2c5282;
	}

	/* Ошибка */
	.error-message {
		background: #fed7d7;
		color: #742a2a;
		padding: 1rem;
		border-radius: 12px;
		text-align: center;
		font-weight: 600;
		margin-bottom: 1rem;
		border: 2px solid #f56565;
		animation: shake 0.5s;
	}

	@keyframes shake {
		0%,
		100% {
			transform: translateX(0);
		}
		25% {
			transform: translateX(-5px);
		}
		75% {
			transform: translateX(5px);
		}
	}

	/* Адаптивность для планшетов */
	@media (max-width: 1024px) {
		.game-layout {
			grid-template-columns: 1fr;
			gap: 1.5rem;
		}

		.level-selector {
			order: 2;
		}

		.game-area {
			order: 1;
		}

		.levels-grid {
			flex-direction: row;
			flex-wrap: wrap;
		}

		.level-card {
			width: auto;
			flex: 1;
			min-width: 140px;
		}
	}

	/* Адаптивность для мобильных */
	@media (max-width: 768px) {
		.game-header h1 {
			font-size: 1.5rem;
		}

		.command-display {
			font-size: 1rem;
			padding: 0.75rem 1rem;
		}

		.command-arrow {
			font-size: 1.5rem;
		}

		.grid {
			max-width: 100%;
		}

		.direction-pad {
			grid-template-columns: repeat(3, 50px);
			grid-template-rows: repeat(3, 50px);
		}

		.dir-button {
			width: 50px;
			height: 50px;
			font-size: 1.25rem;
		}

		.controls {
			flex-direction: column;
			gap: 1rem;
		}

		.action-button {
			width: 100%;
		}
	}

	@media (max-width: 480px) {
		.dictation-game {
			padding: 0.5rem;
		}

		.direction-pad {
			grid-template-columns: repeat(3, 45px);
			grid-template-rows: repeat(3, 45px);
		}

		.dir-button {
			width: 45px;
			height: 45px;
			font-size: 1rem;
		}
	}
</style>
