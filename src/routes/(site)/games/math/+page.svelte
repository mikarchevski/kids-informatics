<script lang="ts">
	import { onMount } from 'svelte';

	type Difficulty = 'easy' | 'medium' | 'hard';
	type GameMode = 'count' | 'add' | 'sub';

	interface MathLevel {
		id: string;
		mode: GameMode;
		questionText: string;
		visuals: string[];
		expression?: string;
		options: number[];
		correctAnswer: number;
	}

	const EMOJIS = ['', '🍌', '🍇', '🍓', '🐶', '🐱', '⭐️', '🎈', '🚗', '🌸', '🐟', '🍄'];

	// Словарь для красивых названий
	const EMOJI_NAMES: Record<string, string> = {
		'🍎': 'яблок',
		'🍌': 'бананов',
		'🍇': 'виноградин',
		'🍓': 'клубничек',
		'🐶': 'собачек',
		'🐱': 'котиков',
		'⭐️': 'звёздочек',
		'🎈': 'шариков',
		'🚗': 'машинок',
		'🌸': 'цветочков',
		'🐟': 'рыбок',
		'🍄': 'грибочков'
	};

	function generateLevel(difficulty: Difficulty, levelIndex: number): MathLevel {
		const randomEmoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
		let mode: GameMode;
		let correctAnswer: number;
		let options: number[];
		let questionText = '';
		let visuals: string[] = [];
		let expression = '';

		if (difficulty === 'easy') {
			mode = 'count';
			correctAnswer = Math.floor(Math.random() * 5) + 1;
			visuals = Array(correctAnswer).fill(randomEmoji);
			const name = EMOJI_NAMES[randomEmoji] || 'предметов';
			questionText = `Сколько здесь ${name}?`;
		} else if (difficulty === 'medium') {
			mode = 'add';
			const a = Math.floor(Math.random() * 4) + 1;
			const b = Math.floor(Math.random() * 4) + 1;
			correctAnswer = a + b;
			expression = `${a} + ${b} = ?`;
			questionText = 'Реши пример:';
		} else {
			mode = 'sub';
			const a = Math.floor(Math.random() * 5) + 5;
			const b = Math.floor(Math.random() * (a - 1)) + 1;
			correctAnswer = a - b;
			expression = `${a} - ${b} = ?`;
			questionText = 'Реши пример:';
		}

		const optionSet = new Set<number>([correctAnswer]);
		while (optionSet.size < 3) {
			const offset = Math.floor(Math.random() * 3) + 1;
			const direction = Math.random() > 0.5 ? 1 : -1;
			const wrong = correctAnswer + offset * direction;
			if (wrong > 0 && wrong !== correctAnswer) {
				optionSet.add(wrong);
			}
		}
		options = Array.from(optionSet).sort(() => Math.random() - 0.5);

		return {
			id: `lvl-${levelIndex}-${Date.now()}`,
			mode,
			questionText,
			visuals,
			expression,
			options,
			correctAnswer
		};
	}

	let difficulty = $state<Difficulty>('easy');
	let currentLevelIndex = $state(0);
	let currentLevel = $state<MathLevel | null>(null);

	let selectedOption = $state<number | null>(null);
	let isCorrect = $state<boolean | null>(null);
	let errors = $state(0);
	let isFinished = $state(false);
	let wrongOptionId = $state<number | null>(null);
	let levelKey = $state(0); // Для принудительного перерендера анимаций

	function loadLevel() {
		currentLevel = generateLevel(difficulty, currentLevelIndex);
		selectedOption = null;
		isCorrect = null;
		wrongOptionId = null;
		levelKey++; // Меняем ключ, чтобы анимация срабатывала заново
	}

	function handleOptionClick(option: number) {
		if (isCorrect === true || !currentLevel) return;

		selectedOption = option;

		if (option === currentLevel.correctAnswer) {
			isCorrect = true;
			const progress = JSON.parse(localStorage.getItem('math-progress') || '{}');
			if (!progress[difficulty] || currentLevelIndex > progress[difficulty]) {
				progress[difficulty] = currentLevelIndex;
			}
			localStorage.setItem('math-progress', JSON.stringify(progress));

			setTimeout(() => {
				currentLevelIndex++;
				if (currentLevelIndex >= 10) {
					isFinished = true;
				} else {
					loadLevel();
				}
			}, 1200);
		} else {
			errors++;
			wrongOptionId = option;
			setTimeout(() => {
				wrongOptionId = null;
				selectedOption = null;
			}, 500);
		}
	}

	function changeDifficulty(newDiff: Difficulty) {
		difficulty = newDiff;
		currentLevelIndex = 0;
		errors = 0;
		isFinished = false;
		loadLevel();
	}

	function restartGame() {
		currentLevelIndex = 0;
		errors = 0;
		isFinished = false;
		loadLevel();
	}

	onMount(() => {
		loadLevel();
	});
</script>

<svelte:head>
	<title>Весёлый счёт — Математика для детей</title>
	<meta name="description" content="Учимся считать, складывать и вычитать в игровой форме." />
</svelte:head>

<div class="math-game">
	<header class="game-header">
		<h1>🔢 Весёлый счёт</h1>
		<p class="subtitle">Считаем, складываем и вычитаем!</p>

		<div class="difficulty-selector">
			<button
				class="diff-btn"
				class:active={difficulty === 'easy'}
				onclick={() => changeDifficulty('easy')}
			>
				Легко
			</button>
			<button
				class="diff-btn"
				class:active={difficulty === 'medium'}
				onclick={() => changeDifficulty('medium')}
			>
				Средне
			</button>
			<button
				class="diff-btn"
				class:active={difficulty === 'hard'}
				onclick={() => changeDifficulty('hard')}
			>
				Сложно
			</button>
		</div>

		<div class="stats">
			<span class="stat-badge">Уровень {currentLevelIndex + 1} из 10</span>
			<span class="stat-badge error-badge">Ошибки: {errors}</span>
		</div>
	</header>

	{#if !isFinished && currentLevel}
		<main class="game-area">
			{#if currentLevel.mode === 'count'}
				<section class="visuals-container" key={levelKey}>
					{#each currentLevel.visuals as emoji, i}
						<span class="visual-emoji" style="animation-delay: {i * 0.1}s">{emoji}</span>
					{/each}
				</section>
			{/if}

			<section class="question-container">
				<p class="question-text">{currentLevel.questionText}</p>
				{#if currentLevel.expression}
					<div class="expression">{currentLevel.expression}</div>
				{/if}
			</section>

			<section class="options-container">
				{#each currentLevel.options as option}
					<button
						class="option-btn"
						class:correct={isCorrect === true && option === currentLevel.correctAnswer}
						class:wrong={wrongOptionId === option}
						disabled={isCorrect === true}
						onclick={() => handleOptionClick(option)}
					>
						<span class="option-text">{option}</span>
					</button>
				{/each}
			</section>
		</main>
	{:else}
		<section class="victory-screen">
			<div class="victory-card">
				<h2>🎉 Молодец!</h2>
				<p>
					Ты прошёл все 10 уровней в режиме «{difficulty === 'easy'
						? 'Легко'
						: difficulty === 'medium'
							? 'Средне'
							: 'Сложно'}»!
				</p>
				<div class="final-stats">
					<p>Всего ошибок: <strong>{errors}</strong></p>
				</div>
				<button class="btn-primary" onclick={restartGame}> 🔄 Пройти ещё раз </button>
			</div>
		</section>
	{/if}
</div>

<style>
	.math-game {
		max-width: 800px;
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
		margin-bottom: 1.5rem;
	}

	.difficulty-selector {
		display: flex;
		justify-content: center;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
	}

	.diff-btn {
		padding: 0.5rem 1.25rem;
		border: 2px solid #e2e8f0;
		border-radius: 20px;
		background: white;
		font-size: 0.95rem;
		font-weight: 600;
		color: #4a5568;
		cursor: pointer;
		transition: all 0.2s;
	}

	.diff-btn:hover {
		border-color: #4299e1;
		color: #4299e1;
	}

	.diff-btn.active {
		background: #4299e1;
		color: white;
		border-color: #4299e1;
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

	.visuals-container {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 1rem;
		padding: 2rem;
		background: white;
		border-radius: 16px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
		width: 100%;
		max-width: 500px;
		min-height: 120px;
	}

	.visual-emoji {
		font-size: 3.5rem;
		animation: popIn 0.4s ease-out backwards;
	}

	@keyframes popIn {
		0% {
			transform: scale(0);
			opacity: 0;
		}
		80% {
			transform: scale(1.1);
		}
		100% {
			transform: scale(1);
			opacity: 1;
		}
	}

	.question-container {
		text-align: center;
	}

	.question-text {
		font-size: 1.25rem;
		color: #4a5568;
		font-weight: 600;
		margin-bottom: 0.5rem;
	}

	.expression {
		font-size: 3rem;
		font-weight: 800;
		color: #2d3748;
		background: #f7fafc;
		padding: 1rem 2rem;
		border-radius: 12px;
		display: inline-block;
		box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
	}

	.options-container {
		display: flex;
		justify-content: center;
		gap: 1.5rem;
		flex-wrap: wrap;
	}

	.option-btn {
		width: 100px;
		height: 100px;
		background: white;
		border: 3px solid #e2e8f0;
		border-radius: 16px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s ease;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
	}

	.option-btn:hover:not(:disabled) {
		transform: translateY(-4px);
		border-color: #4299e1;
		box-shadow: 0 8px 15px rgba(66, 153, 225, 0.2);
	}

	.option-btn:disabled {
		cursor: default;
	}

	.option-text {
		font-size: 3rem;
		font-weight: 700;
		color: #2d3748;
	}

	.option-btn.correct {
		background: #c6f6d5;
		border-color: #48bb78;
		animation: popIn 0.5s ease-out;
	}

	.option-btn.wrong {
		animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
		border-color: #f56565;
		background: #fff5f5;
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
		.visual-emoji {
			font-size: 2.5rem;
		}
		.expression {
			font-size: 2.2rem;
			padding: 0.75rem 1.5rem;
		}
		.option-btn {
			width: 80px;
			height: 80px;
		}
		.option-text {
			font-size: 2.5rem;
		}
	}
</style>
