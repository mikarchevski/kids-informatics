<script lang="ts">
	import { onMount } from 'svelte';
	import './page.css';

	type Difficulty = 'easy' | 'medium';
	type ShapeType = 'triangle' | 'square' | 'rectangle' | 'pentagon' | 'hexagon' | 'circle' | 'star';
	type CellState = 0 | 1;
	type Grid = CellState[];

	interface EasyLevel {
		type: 'easy';
		id: number;
		target: ShapeType;
		options: ShapeType[];
		correctIndex: number;
	}

	interface MediumLevel {
		type: 'medium';
		id: number;
		target: Grid;
		options: Grid[];
		correctIndex: number;
	}

	type Level = EasyLevel | MediumLevel;

	const SHAPES: Record<ShapeType, string> = {
		triangle: 'Треугольник',
		square: 'Квадрат',
		rectangle: 'Прямоугольник',
		pentagon: 'Пятиугольник',
		hexagon: 'Шестиугольник',
		circle: 'Круг',
		star: 'Звезда'
	};

	// --- Генерация лёгкого уровня (SVG фигуры) ---
	function generateEasyLevel(id: number): EasyLevel {
		const shapeTypes = Object.keys(SHAPES) as ShapeType[];
		const targetType = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
		const distractors: ShapeType[] = [];
		const availableTypes = shapeTypes.filter((t) => t !== targetType);

		while (distractors.length < 3) {
			const randomType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
			if (!distractors.includes(randomType)) {
				distractors.push(randomType);
			}
		}

		const options = [targetType, ...distractors].sort(() => Math.random() - 0.5);
		return {
			type: 'easy',
			id,
			target: targetType,
			options,
			correctIndex: options.indexOf(targetType)
		};
	}

	// --- Генерация среднего уровня (Сетка 3x3) ---
	function generateGridShape(cellCount: number): Grid {
		const grid: Grid = Array(9).fill(0);
		const start = Math.floor(Math.random() * 9);
		grid[start] = 1;
		let cells = 1;

		const getNeighbors = (idx: number) => {
			const neighbors = [];
			const row = Math.floor(idx / 3);
			const col = idx % 3;
			if (row > 0) neighbors.push(idx - 3);
			if (row < 2) neighbors.push(idx + 3);
			if (col > 0) neighbors.push(idx - 1);
			if (col < 2) neighbors.push(idx + 1);
			return neighbors;
		};

		let attempts = 0;
		while (cells < cellCount && attempts < 100) {
			const filledIndices = grid.map((v, i) => (v === 1 ? i : -1)).filter((i) => i !== -1);
			const randomFilled = filledIndices[Math.floor(Math.random() * filledIndices.length)];
			const neighbors = getNeighbors(randomFilled).filter((i) => grid[i] === 0);

			if (neighbors.length > 0) {
				const nextCell = neighbors[Math.floor(Math.random() * neighbors.length)];
				grid[nextCell] = 1;
				cells++;
			} else {
				attempts++;
			}
		}

		if (cells < cellCount) {
			const newGrid: Grid = Array(9).fill(0);
			let c = 0;
			while (c < cellCount) {
				const idx = Math.floor(Math.random() * 9);
				if (newGrid[idx] === 0) {
					newGrid[idx] = 1;
					c++;
				}
			}
			return newGrid;
		}

		return grid;
	}

	function generateMediumLevel(id: number): MediumLevel {
		const targetCells = Math.floor(Math.random() * 4) + 3; // 3, 4, 5 или 6 клеток
		const target = generateGridShape(targetCells);

		const distractors: Grid[] = [];
		const possibleCounts = [3, 4, 5, 6].filter((c) => c !== targetCells);

		for (let i = 0; i < 3; i++) {
			const count = possibleCounts[i % possibleCounts.length];
			let distractor = generateGridShape(count);
			while (JSON.stringify(distractor) === JSON.stringify(target)) {
				distractor = generateGridShape(count);
			}
			distractors.push(distractor);
		}

		const options = [target, ...distractors].sort(() => Math.random() - 0.5);
		return {
			type: 'medium',
			id,
			target,
			options,
			correctIndex: options.findIndex((o) => JSON.stringify(o) === JSON.stringify(target))
		};
	}

	// --- Состояние игры ---
	let difficulty = $state<Difficulty>('easy');

	// 🔥 ИСПРАВЛЕНИЕ: Инициализируем массив данными сразу, чтобы не было undefined при первом рендере
	let levels = $state<Level[]>(Array.from({ length: 10 }, (_, i) => generateEasyLevel(i + 1)));

	let currentLevelIndex = $state(0);
	let currentLevel = $derived(levels[currentLevelIndex]);

	let selectedOptionIndex = $state<number | null>(null);
	let isCorrect = $state<boolean | null>(null);
	let errors = $state(0);
	let isFinished = $state(false);
	let wrongOptionIndex = $state<number | null>(null);

	function initGame(diff: Difficulty) {
		difficulty = diff;
		levels =
			diff === 'easy'
				? Array.from({ length: 10 }, (_, i) => generateEasyLevel(i + 1))
				: Array.from({ length: 10 }, (_, i) => generateMediumLevel(i + 1));
		currentLevelIndex = 0;
		selectedOptionIndex = null;
		isCorrect = null;
		wrongOptionIndex = null;
		isFinished = false;
		errors = 0;
	}

	function handleOptionClick(index: number) {
		if (isCorrect === true || !currentLevel) return;

		selectedOptionIndex = index;
		const chosen = currentLevel.options[index];
		const correct = currentLevel.target;

		const isMatch =
			currentLevel.type === 'easy'
				? chosen === correct
				: JSON.stringify(chosen) === JSON.stringify(correct);

		if (isMatch) {
			isCorrect = true;

			const progress = JSON.parse(
				localStorage.getItem(`similar-shape-progress-${difficulty}`) ||
					'{"maxLevel": 0, "totalErrors": 0}'
			);
			if (currentLevelIndex > progress.maxLevel) {
				progress.maxLevel = currentLevelIndex;
			}
			progress.totalErrors += errors;
			localStorage.setItem(`similar-shape-progress-${difficulty}`, JSON.stringify(progress));

			setTimeout(() => {
				if (currentLevelIndex + 1 >= levels.length) {
					isFinished = true;
				} else {
					currentLevelIndex++;
					selectedOptionIndex = null;
					isCorrect = null;
					wrongOptionIndex = null;
				}
			}, 1200);
		} else {
			errors++;
			wrongOptionIndex = index;
			setTimeout(() => {
				wrongOptionIndex = null;
				selectedOptionIndex = null;
			}, 600);
		}
	}

	function restartGame() {
		initGame(difficulty);
	}

	onMount(() => {
		// Проверяем, есть ли сохранённый прогресс, чтобы начать с нужного уровня
		const progress = JSON.parse(
			localStorage.getItem(`similar-shape-progress-${difficulty}`) || '{"maxLevel": 0}'
		);
		if (progress.maxLevel > 0 && progress.maxLevel < 10) {
			currentLevelIndex = progress.maxLevel;
		}
	});
</script>

<svelte:head>
	<title>Найди похожую фигуру — Геометрия для детей</title>
	<meta
		name="description"
		content="Учись находить похожие геометрические фигуры. Развивает геометрическое мышление и внимание."
	/>
</svelte:head>

<div class="similar-shape-game">
	<header class="game-header">
		<h1>🔷 Найди похожую фигуру</h1>
		<p class="subtitle">Тренируем внимание и геометрическое мышление!</p>

		<div class="difficulty-selector">
			<button
				class="diff-btn"
				class:active={difficulty === 'easy'}
				onclick={() => initGame('easy')}
			>
				Лёгкий (Фигуры)
			</button>
			<button
				class="diff-btn"
				class:active={difficulty === 'medium'}
				onclick={() => initGame('medium')}
			>
				Средний (Сетка 3×3)
			</button>
		</div>

		<div class="stats">
			<span class="stat-badge">Уровень {currentLevelIndex + 1} из {levels.length}</span>
			<span class="stat-badge error-badge">Ошибки: {errors}</span>
		</div>
	</header>

	{#if currentLevel && !isFinished}
		<main class="game-area">
			<!-- Целевая фигура -->
			<section class="target-section">
				<p class="section-title">Образец:</p>

				{#if currentLevel.type === 'easy'}
					<div class="shape-display">
						<svg viewBox="0 0 100 100" class="target-svg">
							{#if currentLevel.target === 'triangle'}
								<polygon points="50,10 90,90 10,90" fill="#4299e1" />
							{:else if currentLevel.target === 'square'}
								<rect x="15" y="15" width="70" height="70" fill="#4299e1" />
							{:else if currentLevel.target === 'rectangle'}
								<rect x="10" y="25" width="80" height="50" fill="#4299e1" />
							{:else if currentLevel.target === 'pentagon'}
								<polygon points="50,10 95,40 80,90 20,90 5,40" fill="#4299e1" />
							{:else if currentLevel.target === 'hexagon'}
								<polygon points="50,10 90,30 90,70 50,90 10,70 10,30" fill="#4299e1" />
							{:else if currentLevel.target === 'circle'}
								<circle cx="50" cy="50" r="40" fill="#4299e1" />
							{:else if currentLevel.target === 'star'}
								<polygon
									points="50,10 61,35 88,35 66,52 75,78 50,62 25,78 34,52 12,35 39,35"
									fill="#4299e1"
								/>
							{/if}
						</svg>
						<p class="shape-label">{SHAPES[currentLevel.target]}</p>
					</div>
				{:else}
					<div class="grid-container base-grid">
						{#each currentLevel.target as cell, i}
							<div class="grid-cell" class:filled={cell === 1}></div>
						{/each}
					</div>
				{/if}
			</section>

			<!-- Вопрос -->
			<section class="question-section">
				<p class="question-text">
					{currentLevel.type === 'easy'
						? 'Найди фигуру такого же типа!'
						: 'Найди точно такую же фигуру в сетке!'}
				</p>
			</section>

			<!-- Варианты ответов -->
			<section class="options-section">
				<div class="options-grid">
					{#each currentLevel.options as option, idx}
						<button
							class="option-card"
							class:correct={isCorrect === true && idx === selectedOptionIndex}
							class:wrong={wrongOptionIndex === idx}
							disabled={isCorrect === true}
							onclick={() => handleOptionClick(idx)}
							aria-label={`Вариант ${idx + 1}`}
						>
							{#if currentLevel.type === 'easy'}
								<svg viewBox="0 0 100 100" class="option-svg">
									{#if option === 'triangle'}
										<polygon points="50,10 90,90 10,90" fill="#718096" />
									{:else if option === 'square'}
										<rect x="15" y="15" width="70" height="70" fill="#718096" />
									{:else if option === 'rectangle'}
										<rect x="10" y="25" width="80" height="50" fill="#718096" />
									{:else if option === 'pentagon'}
										<polygon points="50,10 95,40 80,90 20,90 5,40" fill="#718096" />
									{:else if option === 'hexagon'}
										<polygon points="50,10 90,30 90,70 50,90 10,70 10,30" fill="#718096" />
									{:else if option === 'circle'}
										<circle cx="50" cy="50" r="40" fill="#718096" />
									{:else if option === 'star'}
										<polygon
											points="50,10 61,35 88,35 66,52 75,78 50,62 25,78 34,52 12,35 39,35"
											fill="#718096"
										/>
									{/if}
								</svg>
							{:else}
								<div class="grid-container">
									{#each option as cell, i}
										<div class="grid-cell" class:filled={cell === 1}></div>
									{/each}
								</div>
							{/if}
						</button>
					{/each}
				</div>
			</section>
		</main>
	{:else if isFinished}
		<section class="victory-screen">
			<div class="victory-card">
				<h2>🎉 Отличная работа!</h2>
				<p>
					Ты успешно прошёл все уровни в режиме «{difficulty === 'easy' ? 'Лёгкий' : 'Средний'}»!
				</p>
				<div class="final-stats">
					<p>Всего ошибок: <strong>{errors}</strong></p>
				</div>
				<button class="btn-primary" onclick={restartGame}> 🔄 Пройти всё заново </button>
			</div>
		</section>
	{/if}
</div>

<style>
</style>
