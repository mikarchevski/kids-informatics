<script lang="ts">
	import { onMount } from 'svelte';
	import './page.css';

	type CellState = 0 | 1; // Исправлено: используем 0 и 1 вместо строк
	type Grid = CellState[];

	interface Level {
		id: number;
		base: Grid;
		targetDeg: 90 | 180 | 270;
		question: string;
	}

	// Утилиты для вращения сетки 3x3
	function rotate90(grid: Grid): Grid {
		return [grid[6], grid[3], grid[0], grid[7], grid[4], grid[1], grid[8], grid[5], grid[2]];
	}

	function rotate180(grid: Grid): Grid {
		return [grid[8], grid[7], grid[6], grid[5], grid[4], grid[3], grid[2], grid[1], grid[0]];
	}

	function rotate270(grid: Grid): Grid {
		return [grid[2], grid[5], grid[8], grid[1], grid[4], grid[7], grid[0], grid[3], grid[6]];
	}

	function mirrorH(grid: Grid): Grid {
		return [grid[2], grid[1], grid[0], grid[5], grid[4], grid[3], grid[8], grid[7], grid[6]];
	}

	// База уровней
	const baseLevels: Omit<Level, 'options' | 'correct'>[] = [
		{
			id: 1,
			base: [1, 0, 0, 1, 0, 0, 1, 1, 1],
			targetDeg: 90,
			question: 'Поверни на 90° по часовой стрелке'
		},
		{ id: 2, base: [0, 1, 0, 0, 1, 0, 1, 1, 1], targetDeg: 180, question: 'Поверни на 180°' },
		{
			id: 3,
			base: [1, 1, 0, 0, 1, 0, 0, 1, 1],
			targetDeg: 90,
			question: 'Поверни на 90° по часовой стрелке'
		},
		{
			id: 4,
			base: [1, 1, 1, 1, 0, 0, 1, 0, 0],
			targetDeg: 270,
			question: 'Поверни на 270° по часовой стрелке (или 90° против)'
		},
		{ id: 5, base: [0, 1, 1, 1, 1, 0, 0, 1, 0], targetDeg: 180, question: 'Поверни на 180°' },
		{
			id: 6,
			base: [1, 0, 0, 1, 1, 0, 0, 1, 0],
			targetDeg: 90,
			question: 'Поверни на 90° по часовой стрелке'
		},
		{
			id: 7,
			base: [0, 0, 1, 0, 1, 1, 1, 1, 0],
			targetDeg: 270,
			question: 'Поверни на 270° по часовой стрелке'
		},
		{ id: 8, base: [1, 1, 0, 0, 1, 0, 0, 1, 1], targetDeg: 180, question: 'Поверни на 180°' }
	];

	interface FullLevel extends Level {
		correct: Grid;
		options: Grid[];
	}

	function generateLevelData(baseLevel: (typeof baseLevels)[0]): FullLevel {
		let correct: Grid;
		if (baseLevel.targetDeg === 90) correct = rotate90(baseLevel.base);
		else if (baseLevel.targetDeg === 180) correct = rotate180(baseLevel.base);
		else correct = rotate270(baseLevel.base);

		const distractors: Grid[] = [];
		const candidates = [
			mirrorH(baseLevel.base),
			baseLevel.targetDeg === 90 ? rotate270(baseLevel.base) : rotate90(baseLevel.base),
			baseLevel.targetDeg === 180 ? rotate90(baseLevel.base) : rotate180(baseLevel.base)
		];

		for (const cand of candidates) {
			if (distractors.length < 2 && JSON.stringify(cand) !== JSON.stringify(correct)) {
				if (!distractors.some((d) => JSON.stringify(d) === JSON.stringify(cand))) {
					distractors.push(cand);
				}
			}
		}

		while (distractors.length < 2) {
			const randomGrid: Grid = Array.from({ length: 9 }, () => (Math.random() > 0.5 ? 1 : 0));
			if (
				JSON.stringify(randomGrid) !== JSON.stringify(correct) &&
				!distractors.some((d) => JSON.stringify(d) === JSON.stringify(randomGrid))
			) {
				distractors.push(randomGrid);
			}
		}

		const options = [correct, ...distractors].sort(() => Math.random() - 0.5);

		return { ...baseLevel, correct, options };
	}

	const levels: FullLevel[] = baseLevels.map(generateLevelData);

	let currentLevelIndex = $state(0);
	let currentLevel = $derived(levels[currentLevelIndex]);

	let selectedOptionIndex = $state<number | null>(null);
	let isCorrect = $state<boolean | null>(null);
	let errors = $state(0);
	let isFinished = $state(false);
	let wrongOptionIndex = $state<number | null>(null);

	function loadLevel(idx: number) {
		currentLevelIndex = idx;
		selectedOptionIndex = null;
		isCorrect = null;
		wrongOptionIndex = null;

		if (idx >= levels.length) {
			isFinished = true;
		}
	}

	function handleOptionClick(index: number) {
		if (isCorrect === true) return;

		selectedOptionIndex = index;
		const chosenGrid = currentLevel.options[index];

		if (JSON.stringify(chosenGrid) === JSON.stringify(currentLevel.correct)) {
			isCorrect = true;

			const progress = JSON.parse(
				localStorage.getItem('rotate-shape-progress') || '{"maxLevel": 0, "totalErrors": 0}'
			);
			if (currentLevelIndex > progress.maxLevel) {
				progress.maxLevel = currentLevelIndex;
			}
			progress.totalErrors += errors;
			localStorage.setItem('rotate-shape-progress', JSON.stringify(progress));

			setTimeout(() => {
				loadLevel(currentLevelIndex + 1);
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
		errors = 0;
		isFinished = false;
		localStorage.removeItem('rotate-shape-progress');
		loadLevel(0);
	}

	onMount(() => {
		const progress = JSON.parse(localStorage.getItem('rotate-shape-progress') || '{"maxLevel": 0}');
		loadLevel(progress.maxLevel < levels.length ? progress.maxLevel : 0);
	});
</script>

<svelte:head>
	<title>Поверни фигуру — Пространственное мышление</title>
	<meta
		name="description"
		content="Развивай пространственное мышление: учись мысленно вращать фигуры и находить правильные отражения."
	/>
</svelte:head>

<div class="rotate-game">
	<header class="game-header">
		<h1>🔄 Поверни фигуру</h1>
		<p class="subtitle">Представь, как фигура выглядит после поворота!</p>
		<div class="stats">
			<span class="stat-badge">Уровень {currentLevelIndex + 1} из {levels.length}</span>
			<span class="stat-badge error-badge">Ошибки: {errors}</span>
		</div>
	</header>

	{#if !isFinished}
		<main class="game-area">
			<!-- Исходная фигура -->
			<section class="base-figure-section">
				<p class="section-title">Исходная фигура:</p>
				<div class="grid-container base-grid">
					{#each currentLevel.base as cell, i}
						<div class="grid-cell" class:filled={cell === 1}></div>
					{/each}
				</div>
			</section>

			<!-- Вопрос -->
			<section class="question-section">
				<p class="question-text">
					{currentLevel.question}
				</p>
			</section>

			<!-- Варианты ответов -->
			<section class="options-section">
				<p class="section-title">Выбери правильный вариант:</p>
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
							<div class="grid-container">
								{#each option as cell, i}
									<div class="grid-cell" class:filled={cell === 1}></div>
								{/each}
							</div>
						</button>
					{/each}
				</div>
			</section>
		</main>
	{:else}
		<section class="victory-screen">
			<div class="victory-card">
				<h2>🎉 Отличная работа!</h2>
				<p>Ты успешно прошёл все уровни и отлично развиваешь пространственное мышление!</p>
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
