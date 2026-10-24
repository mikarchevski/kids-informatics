<script lang="ts">
	import './page.css';
	import { onMount } from 'svelte';

	// Типы
	type Direction = 'up' | 'down' | 'left' | 'right';

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

	// Пресеты уровней
	const levels: Level[] = [
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
			id: 'letter-n',
			name: 'Буква Н',
			emoji: 'Н',
			gridSize: 7,
			startPos: { x: 1, y: 1 },
			commands: [
				{ direction: 'down', steps: 5 },
				{ direction: 'up', steps: 3 },
				{ direction: 'right', steps: 3 },
				{ direction: 'down', steps: 3 },
				{ direction: 'up', steps: 5 }
			],
			description: 'Сложная фигура с пересечением'
		},
		{
			id: 'stairs',
			name: 'Лесенка',
			emoji: '🪜',
			gridSize: 6,
			startPos: { x: 0, y: 0 },
			commands: [
				{ direction: 'right', steps: 1 },
				{ direction: 'down', steps: 1 },
				{ direction: 'right', steps: 1 },
				{ direction: 'down', steps: 1 },
				{ direction: 'right', steps: 1 },
				{ direction: 'down', steps: 1 },
				{ direction: 'right', steps: 1 },
				{ direction: 'down', steps: 1 }
			],
			description: 'Ступеньки вниз'
		},
		{
			id: 'house',
			name: 'Домик',
			emoji: '🏠',
			gridSize: 10,
			startPos: { x: 1, y: 8 }, // Начинаем с левого нижнего угла
			commands: [
				{ direction: 'right', steps: 7 }, // Основание дома (пол)
				{ direction: 'up', steps: 5 }, // Правая стена
				{ direction: 'left', steps: 1 }, // Правый скат крыши
				{ direction: 'up', steps: 1 }, // Вершина крыши
				{ direction: 'left', steps: 1 }, // Правый скат крыши
				{ direction: 'up', steps: 1 }, // Вершина крыши
				{ direction: 'left', steps: 1 }, // Правый скат крыши
				{ direction: 'up', steps: 1 }, // Вершина крыши
				{ direction: 'left', steps: 1 }, // Левый скат крыши
				{ direction: 'down', steps: 1 }, // Спуск к левой стене
				{ direction: 'left', steps: 1 }, // Левый скат крыши
				{ direction: 'down', steps: 1 }, // Спуск к левой стене
				{ direction: 'left', steps: 1 }, // Левый скат крыши
				{ direction: 'down', steps: 1 }, // Спуск к левой стене
				{ direction: 'left', steps: 1 }, // Левый скат крыши
				{ direction: 'down', steps: 1 }, // Спуск к левой стене
				{ direction: 'down', steps: 4 } // Левая стена (возврат вниз)
			],
			description: 'Домик с треугольной крышей'
		}
	];

	// Состояние игры
	let currentLevel = $state<Level>(levels[0]);
	let position = $state<{ x: number; y: number }>({ x: 0, y: 0 });
	let drawnCells = $state<Set<string>>(new Set());
	let currentCommandIndex = $state(0);
	let isAutoPlaying = $state(false);
	let isCompleted = $state(false);
	let autoPlayTimeout: number | null = null;

	// Инициализация уровня
	function loadLevel(level: Level) {
		currentLevel = level;
		position = { ...level.startPos };
		drawnCells = new Set([`${position.x},${position.y}`]);
		currentCommandIndex = 0;
		isCompleted = false;
		stopAutoPlay();
	}

	// Выполнить один шаг
	function executeStep() {
		if (isCompleted) return;
		if (currentCommandIndex >= currentLevel.commands.length) {
			isCompleted = true;
			stopAutoPlay();
			return;
		}

		const command = currentLevel.commands[currentCommandIndex];

		// Двигаемся на 1 клетку в нужном направлении
		switch (command.direction) {
			case 'up':
				position = { ...position, y: position.y - 1 };
				break;
			case 'down':
				position = { ...position, y: position.y + 1 };
				break;
			case 'left':
				position = { ...position, x: position.x - 1 };
				break;
			case 'right':
				position = { ...position, x: position.x + 1 };
				break;
		}

		// Добавляем клетку в нарисованные
		drawnCells = new Set([...drawnCells, `${position.x},${position.y}`]);

		// Проверяем, закончилась ли текущая команда
		// Для этого нужно отслеживать шаги внутри команды
		// Упростим: каждый клик = 1 шаг, но команда считается выполненной после N шагов
		// Используем отдельный счётчик шагов текущей команды
	}

	// Переработанная логика с учётом шагов внутри команды
	let currentStepInCommand = $state(0);

	let lastError = $state<string | null>(null);

	function executeStepV2() {
		if (isCompleted) return;
		if (currentCommandIndex >= currentLevel.commands.length) {
			isCompleted = true;
			stopAutoPlay();
			return;
		}

		const command = currentLevel.commands[currentCommandIndex];

		// Вычисляем новую позицию
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
			lastError = `⚠️ Нельзя выйти за пределы поля! Попробуй другую команду.`;
			setTimeout(() => {
				lastError = null;
			}, 2000);
			stopAutoPlay();
			return;
		}

		// Применяем новое положение
		position = { x: newX, y: newY };
		drawnCells = new Set([...drawnCells, `${position.x},${position.y}`]);
		currentStepInCommand++;
		lastError = null;

		// Если все шаги команды выполнены — переходим к следующей
		if (currentStepInCommand >= command.steps) {
			currentStepInCommand = 0;
			currentCommandIndex++;

			if (currentCommandIndex >= currentLevel.commands.length) {
				isCompleted = true;
				stopAutoPlay();
			}
		}
	}

	// Ручное управление стрелками
	function handleDirectionClick(direction: Direction) {
		if (isCompleted) return;

		// Проверяем, совпадает ли направление с текущей командой
		const currentCommand = currentLevel.commands[currentCommandIndex];
		if (!currentCommand) return;

		if (currentCommand.direction === direction) {
			executeStepV2();
		} else {
			// Ошибка — направление не совпадает с командой
			// Можно добавить визуальную обратную связь
			console.log('Неверное направление!');
		}
	}

	// Автоматическое выполнение
	function startAutoPlay() {
		if (isCompleted || isAutoPlaying) return;
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

	// Сброс текущего уровня
	function resetLevel() {
		stopAutoPlay();
		loadLevel(currentLevel);
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

	onMount(() => {
		loadLevel(currentLevel);
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
		<h1>️ Графический диктант</h1>
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
						class:active={currentLevel.id === level.id}
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

				{#if !isCompleted && currentCommandIndex < currentLevel.commands.length}
					{@const cmd = currentLevel.commands[currentCommandIndex]}
					<div class="command-display">
						<span class="command-arrow">
							{cmd.direction === 'up'
								? '⬆️'
								: cmd.direction === 'down'
									? '⬇️'
									: cmd.direction === 'left'
										? '⬅️'
										: '➡️'}
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
				{:else if isCompleted}
					<div class="command-display completed">
						<span class="command-arrow">🎉</span>
						<span class="command-text">Фигура готова!</span>
					</div>
				{/if}
			</section>

			<!-- Игровое поле -->
			<section class="game-board" aria-label="Игровое поле">
				<div class="grid" style="grid-template-columns: repeat({currentLevel.gridSize}, 1fr);">
					{#each Array(currentLevel.gridSize * currentLevel.gridSize) as _, index}
						{@const x = index % currentLevel.gridSize}
						{@const y = Math.floor(index / currentLevel.gridSize)}
						{@const cellKey = `${x},${y}`}
						{@const isDrawn = drawnCells.has(cellKey)}
						{@const isCurrent = position.x === x && position.y === y}

						<div class="cell" class:drawn={isDrawn} class:current={isCurrent}>
							{#if isCurrent && !isDrawn}
								<span class="cursor">●</span>
							{:else if isCurrent && isDrawn}
								<span class="cursor">★</span>
							{/if}
						</div>
					{/each}
				</div>
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
						️⬇️
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
		<h3>Как играть</h3>
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
