<script lang="ts">
	import './page.css';
	import { onMount } from 'svelte';

	// Типы
	type GameState = 'ready' | 'playing' | 'finished';
	type CellState = 'hidden' | 'found' | 'error';

	interface Cell {
		value: number;
		state: CellState;
	}

	// Состояния
	let gridSize = $state(5); // Размер таблицы (5x5 = 25 чисел)
	let cells = $state<Cell[]>([]);
	let currentNumber = $state(1);
	let gameState = $state<GameState>('ready');
	let startTime = $state<number | null>(null);
	let elapsedTime = $state(0);
	let bestTime = $state<number | null>(null);
	let timerInterval: number | null = null;

	// Размеры таблиц
	const gridSizes = [
		{ size: 3, label: '3×3 (9 чисел)', difficulty: 'Легко' },
		{ size: 4, label: '4×4 (16 чисел)', difficulty: 'Средне' },
		{ size: 5, label: '5×5 (25 чисел)', difficulty: 'Сложно' }
	];

	// Инициализация игры
	function initializeGame() {
		const totalCells = gridSize * gridSize;
		const numbers = Array.from({ length: totalCells }, (_, i) => i + 1);

		// Перемешивание (алгоритм Фишера-Йетса)
		for (let i = numbers.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[numbers[i], numbers[j]] = [numbers[j], numbers[i]];
		}

		cells = numbers.map((value) => ({ value, state: 'hidden' }));
		currentNumber = 1;
		gameState = 'ready';
		startTime = null;
		elapsedTime = 0;

		if (timerInterval) {
			clearInterval(timerInterval);
			timerInterval = null;
		}

		// Загрузка лучшего времени из localStorage
		const saved = localStorage.getItem(`schulte-best-${gridSize}`);
		bestTime = saved ? parseFloat(saved) : null;
	}

	// Запуск таймера
	function startTimer() {
		startTime = Date.now();
		timerInterval = window.setInterval(() => {
			elapsedTime = (Date.now() - startTime!) / 1000;
		}, 100);
	}

	// Остановка таймера
	function stopTimer() {
		if (timerInterval) {
			clearInterval(timerInterval);
			timerInterval = null;
		}
	}

	// Обработка клика на ячейку
	function handleCellClick(cell: Cell) {
		if (gameState === 'finished') return;

		// Запуск таймера при первом клике
		if (gameState === 'ready') {
			gameState = 'playing';
			startTimer();
		}

		// Проверка правильности
		if (cell.value === currentNumber) {
			cell.state = 'found';
			currentNumber++;

			// Проверка завершения
			if (currentNumber > gridSize * gridSize) {
				gameState = 'finished';
				stopTimer();

				// Сохранение лучшего времени
				if (!bestTime || elapsedTime < bestTime) {
					bestTime = elapsedTime;
					localStorage.setItem(`schulte-best-${gridSize}`, elapsedTime.toString());
				}
			}
		} else {
			// Ошибка
			cell.state = 'error';
			setTimeout(() => {
				cell.state = 'hidden';
			}, 500);
		}
	}

	// Форматирование времени
	function formatTime(seconds: number): string {
		return seconds.toFixed(2) + ' сек';
	}

	// Запуск при монтировании
	onMount(() => {
		initializeGame();
	});

	// Очистка при размонтировании
	$effect(() => {
		return () => {
			if (timerInterval) {
				clearInterval(timerInterval);
			}
		};
	});
</script>

<svelte:head>
	<title>Таблица Шульте — Тренажёр внимания и скорочтения</title>
	<meta
		name="description"
		content="Онлайн-тренажёр Таблица Шульте для развития внимания и скорочтения у детей и взрослых. Найди все числа по порядку как можно быстрее!"
	/>
</svelte:head>

<div class="schulte-game">
	<header class="game-header">
		<div class="game-header__title">🔢 Таблица Шульте</div>
		<p class="subtitle">Найдите все числа по порядку как можно быстрее!</p>
	</header>

	<!-- Панель управления -->
	<section class="control-panel" aria-label="Настройки игры">
		<div class="size-selector">
			<label for="grid-size">Размер таблицы:</label>
			<select id="grid-size" bind:value={gridSize} onchange={initializeGame}>
				{#each gridSizes as option}
					<option value={option.size}>{option.label} — {option.difficulty}</option>
				{/each}
			</select>
		</div>

		<button class="restart-button" onclick={initializeGame}> 🔄 Новая игра </button>
	</section>

	<!-- Информационная панель -->
	<section class="info-panel" aria-label="Информация об игре">
		<div class="info-item">
			<span class="info-label">⏱️ Время:</span>
			<span class="info-value">{formatTime(elapsedTime)}</span>
		</div>

		<div class="info-item">
			<span class="info-label">🎯 Следующее число:</span>
			<span class="info-value current-number">{gameState === 'finished' ? '✓' : currentNumber}</span
			>
		</div>

		{#if bestTime !== null}
			<div class="info-item">
				<span class="info-label">🏆 Лучшее время:</span>
				<span class="info-value best-time">{formatTime(bestTime)}</span>
			</div>
		{/if}
	</section>

	<!-- Игровое поле -->
	<section class="game-board" aria-label="Игровое поле">
		<div
			class="grid"
			style="grid-template-columns: repeat({gridSize}, 1fr);"
			role="grid"
			aria-label="Таблица с числами"
		>
			{#each cells as cell (cell.value)}
				<button
					class="cell cell-{cell.state}"
					onclick={() => handleCellClick(cell)}
					disabled={cell.state === 'found'}
					aria-label="Число {cell.value}"
				>
					{#if cell.state === 'found'}
						✓
					{:else}
						{cell.value}
					{/if}
				</button>
			{/each}
		</div>
	</section>

	<!-- Сообщение о завершении -->
	{#if gameState === 'finished'}
		<div class="completion-message" role="alert">
			<h2>🎉 Поздравляем!</h2>
			<p>Вы нашли все числа за <strong>{formatTime(elapsedTime)}</strong></p>
			{#if bestTime === elapsedTime}
				<p class="new-record">🏆 Новый рекорд!</p>
			{/if}
			<button class="play-again-button" onclick={initializeGame}> Играть ещё раз </button>
		</div>
	{/if}

	<!-- Инструкции -->
	<section class="instructions" aria-label="Инструкции">
		<h3>📖 Как играть</h3>
		<ol>
			<li>Выберите размер таблицы (3×3, 4×4 или 5×5)</li>
			<li>Найдите число <strong>1</strong> и нажмите на него</li>
			<li>Продолжайте искать числа по порядку: 2, 3, 4 и так далее</li>
			<li>Старайтесь сделать это как можно быстрее!</li>
		</ol>
		<p class="tip">
			💡 <strong>Совет:</strong> Не двигайте глазами по таблице — смотрите в центр и используйте периферийное
			зрение.
		</p>
	</section>
</div>

<style>
</style>
