<script lang="ts">
	import { onMount } from 'svelte';

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
	.rotate-game {
		max-width: 700px;
		margin: 0 auto;
		padding: 1rem;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.game-header {
		text-align: center;
		margin-bottom: 2rem;
	}

	.game-header h1 {
		font-size: 2rem;
		color: #2d3748;
		margin-bottom: 0.25rem;
	}

	.subtitle {
		color: #718096;
		font-size: 1.1rem;
		margin-bottom: 1rem;
	}

	.stats {
		display: flex;
		justify-content: center;
		gap: 1rem;
	}

	.stat-badge {
		background: #edf2f7;
		padding: 0.4rem 1rem;
		border-radius: 20px;
		font-weight: 600;
		color: #4a5568;
		font-size: 0.9rem;
	}

	.error-badge {
		background: #fed7d7;
		color: #c53030;
	}

	.game-area {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 2rem;
		align-items: center;
	}

	.section-title {
		font-size: 1.1rem;
		font-weight: 600;
		color: #4a5568;
		margin-bottom: 0.75rem;
		text-align: center;
	}

	/* Сетка 3x3 */
	.grid-container {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 4px;
		background: #e2e8f0;
		padding: 4px;
		border-radius: 8px;
		width: 120px;
		height: 120px;
	}

	.base-grid {
		width: 150px;
		height: 150px;
		margin: 0 auto;
	}

	.grid-cell {
		background: #ffffff;
		border-radius: 4px;
		transition: background 0.3s ease;
	}

	.grid-cell.filled {
		background: #4299e1;
		box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.question-section {
		text-align: center;
		background: #ebf8ff;
		padding: 1rem 1.5rem;
		border-radius: 12px;
		border-left: 4px solid #4299e1;
		width: 100%;
		max-width: 500px;
	}

	.question-text {
		font-size: 1.2rem;
		font-weight: 700;
		color: #2b6cb0;
		margin: 0;
	}

	.options-grid {
		display: flex;
		justify-content: center;
		gap: 1.5rem;
		flex-wrap: wrap;
	}

	.option-card {
		background: white;
		border: 3px solid #e2e8f0;
		border-radius: 12px;
		padding: 1rem;
		cursor: pointer;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.option-card:hover:not(:disabled) {
		transform: translateY(-4px);
		border-color: #4299e1;
		box-shadow: 0 8px 15px rgba(66, 153, 225, 0.2);
	}

	.option-card:disabled {
		cursor: default;
	}

	.option-card.correct {
		background: #c6f6d5;
		border-color: #48bb78;
		animation: popIn 0.5s ease-out;
	}

	.option-card.wrong {
		animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
		border-color: #f56565;
		background: #fff5f5;
	}

	@keyframes popIn {
		0% {
			transform: scale(0.8);
			opacity: 0;
		}
		70% {
			transform: scale(1.05);
		}
		100% {
			transform: scale(1);
			opacity: 1;
		}
	}

	@keyframes shake {
		10%,
		90% {
			transform: translate3d(-1px, 0, 0);
		}
		20%,
		80% {
			transform: translate3d(2px, 0, 0);
		}
		30%,
		50%,
		70% {
			transform: translate3d(-4px, 0, 0);
		}
		40%,
		60% {
			transform: translate3d(4px, 0, 0);
		}
	}

	.victory-screen {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.victory-card {
		background: white;
		padding: 3rem 2rem;
		border-radius: 20px;
		text-align: center;
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
		animation: popIn 0.6s ease-out;
		max-width: 400px;
		width: 100%;
	}

	.victory-card h2 {
		font-size: 2rem;
		color: #48bb78;
		margin-bottom: 1rem;
	}

	.final-stats {
		background: #f7fafc;
		padding: 1rem;
		border-radius: 12px;
		margin: 1.5rem 0;
		color: #4a5568;
	}

	.btn-primary {
		background: #48bb78;
		color: white;
		border: none;
		padding: 1rem 2rem;
		border-radius: 10px;
		font-size: 1.1rem;
		font-weight: 600;
		cursor: pointer;
		transition:
			transform 0.1s,
			background 0.2s;
	}

	.btn-primary:hover {
		background: #38a169;
	}

	.btn-primary:active {
		transform: scale(0.95);
	}

	@media (max-width: 600px) {
		.grid-container {
			width: 100px;
			height: 100px;
		}
		.base-grid {
			width: 120px;
			height: 120px;
		}
		.options-grid {
			gap: 1rem;
		}
		.option-card {
			padding: 0.75rem;
		}
	}
</style>
