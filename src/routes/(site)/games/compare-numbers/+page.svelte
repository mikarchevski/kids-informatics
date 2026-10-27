<script lang="ts">
	import { onMount } from 'svelte';
	import './page.css';

	type Difficulty = 'easy' | 'medium';

	interface GameState {
		num1: number;
		num2: number;
		score: number;
		isPlaying: boolean;
		isFinished: boolean;
		hintUsed: boolean;
		lastResult: 'correct' | 'wrong' | null;
		difficulty: Difficulty;
	}

	let gameState = $state<GameState>({
		num1: 0,
		num2: 0,
		score: 0,
		isPlaying: false,
		isFinished: false,
		hintUsed: false,
		lastResult: null,
		difficulty: 'easy'
	});

	let highScores = $state({
		easy: 0,
		medium: 0
	});

	// Генерация случайных чисел в зависимости от сложности
	function generateNumbers() {
		if (gameState.difficulty === 'easy') {
			// Цифры: 0-9
			gameState.num1 = Math.floor(Math.random() * 10);
			gameState.num2 = Math.floor(Math.random() * 10);
		} else {
			// Числа: 10-99
			gameState.num1 = Math.floor(Math.random() * 90) + 10;
			gameState.num2 = Math.floor(Math.random() * 90) + 10;
		}
		gameState.hintUsed = false;
		gameState.lastResult = null;
	}

	// Определение правильного знака
	function getCorrectSign(): string {
		if (gameState.num1 > gameState.num2) return '>';
		if (gameState.num1 < gameState.num2) return '<';
		return '=';
	}

	// Проверка ответа
	function checkAnswer(sign: string) {
		if (!gameState.isPlaying || gameState.isFinished) return;

		const correctSign = getCorrectSign();

		if (sign === correctSign) {
			// Правильный ответ: +10 очков
			gameState.score += 10;
			gameState.lastResult = 'correct';

			// Обновление рекорда
			if (gameState.score > highScores[gameState.difficulty]) {
				highScores[gameState.difficulty] = gameState.score;
				localStorage.setItem('compare-numbers-highscores', JSON.stringify(highScores));
			}
		} else {
			// Неправильный ответ
			gameState.lastResult = 'wrong';
		}

		// Генерация новых чисел
		setTimeout(() => {
			generateNumbers();
		}, 300);
	}

	// Использование подсказки
	function useHint() {
		if (!gameState.isPlaying || gameState.hintUsed) return;
		gameState.hintUsed = true;
	}

	// Старт игры
	function startGame() {
		gameState.isPlaying = true;
		gameState.isFinished = false;
		gameState.score = 0;
		generateNumbers();
	}

	// Конец игры
	function endGame() {
		gameState.isPlaying = false;
		gameState.isFinished = true;
	}

	// Смена сложности
	function changeDifficulty(diff: Difficulty) {
		gameState.difficulty = diff;
		if (gameState.isPlaying) {
			startGame();
		}
	}

	// Сброс игры
	function resetGame() {
		gameState = {
			num1: 0,
			num2: 0,
			score: 0,
			isPlaying: false,
			isFinished: false,
			hintUsed: false,
			lastResult: null,
			difficulty: gameState.difficulty
		};
	}

	onMount(() => {
		// Загрузка рекордов
		const saved = localStorage.getItem('compare-numbers-highscores');
		if (saved) {
			const parsed = JSON.parse(saved);
			highScores.easy = parsed.easy || 0;
			highScores.medium = parsed.medium || 0;
		}
	});
</script>

<svelte:head>
	<title>Больше или меньше — Сравнивай числа</title>
	<meta
		name="description"
		content="Тренируй внимание: сравнивай числа и выбирай правильный знак! Два уровня сложности."
	/>
</svelte:head>

<div class="compare-game">
	<header class="game-header">
		<h1>⚖️ Больше или меньше</h1>
		<p class="subtitle">Сравнивай числа и зарабатывай очки!</p>
	</header>

	{#if !gameState.isPlaying && !gameState.isFinished}
		<!-- Экран старта -->
		<section class="start-screen">
			<div class="info-card">
				<h2>Правила игры:</h2>
				<ul>
					<li>🎯 Сравни два числа</li>
					<li>✅ Правильный ответ: <strong>+10 очков</strong></li>
					<li>Ошибка: попробуй ещё раз</li>
					<li>💡 Подсказка подсветит правильный знак</li>
				</ul>

				<div class="difficulty-section">
					<h3>Выбери уровень:</h3>
					<div class="difficulty-buttons">
						<button
							class="diff-btn"
							class:active={gameState.difficulty === 'easy'}
							onclick={() => changeDifficulty('easy')}
						>
							<div class="diff-title">🔢 Лёгкий</div>
							<div class="diff-desc">Цифры 0-9</div>
							{#if highScores.easy > 0}
								<div class="diff-score">Рекорд: {highScores.easy}</div>
							{/if}
						</button>

						<button
							class="diff-btn"
							class:active={gameState.difficulty === 'medium'}
							onclick={() => changeDifficulty('medium')}
						>
							<div class="diff-title">🔢 Средний</div>
							<div class="diff-desc">Числа 10-99</div>
							{#if highScores.medium > 0}
								<div class="diff-score">Рекорд: {highScores.medium}</div>
							{/if}
						</button>
					</div>
				</div>

				<button class="btn-primary btn-large" onclick={startGame}> Начать игру </button>
			</div>
		</section>
	{:else if gameState.isPlaying}
		<!-- Игровой экран -->
		<main class="game-area">
			<!-- Выбор сложности во время игры -->
			<section class="difficulty-selector">
				<button
					class="diff-toggle"
					class:active={gameState.difficulty === 'easy'}
					onclick={() => changeDifficulty('easy')}
				>
					🔢 Лёгкий
				</button>
				<button
					class="diff-toggle"
					class:active={gameState.difficulty === 'medium'}
					onclick={() => changeDifficulty('medium')}
				>
					🔢🔢 Средний
				</button>
			</section>

			<!-- Счёт -->
			<section class="score-display">
				<span class="score-label">Очки:</span>
				<span class="score-value">{gameState.score}</span>
			</section>

			<!-- Числа -->
			<section class="numbers-display">
				<div class="number-box">
					<span class="number">{gameState.num1}</span>
				</div>
				<div class="question-mark">?</div>
				<div class="number-box">
					<span class="number">{gameState.num2}</span>
				</div>
			</section>

			<!-- Кнопки выбора -->
			<section class="signs-container">
				<button
					class="sign-btn"
					class:correct={gameState.hintUsed && getCorrectSign() === '<'}
					class:wrong={gameState.lastResult === 'wrong' && getCorrectSign() !== '<'}
					onclick={() => checkAnswer('<')}
					disabled={gameState.hintUsed}
				>
					<span class="sign">&lt;</span>
					<span class="sign-label">меньше</span>
				</button>

				<button
					class="sign-btn"
					class:correct={gameState.hintUsed && getCorrectSign() === '='}
					class:wrong={gameState.lastResult === 'wrong' && getCorrectSign() !== '='}
					onclick={() => checkAnswer('=')}
					disabled={gameState.hintUsed}
				>
					<span class="sign">=</span>
					<span class="sign-label">равно</span>
				</button>

				<button
					class="sign-btn"
					class:correct={gameState.hintUsed && getCorrectSign() === '>'}
					class:wrong={gameState.lastResult === 'wrong' && getCorrectSign() !== '>'}
					onclick={() => checkAnswer('>')}
					disabled={gameState.hintUsed}
				>
					<span class="sign">&gt;</span>
					<span class="sign-label">больше</span>
				</button>
			</section>

			<!-- Подсказка -->
			{#if !gameState.hintUsed}
				<button class="hint-btn" onclick={useHint}> 💡 Подсказка </button>
			{/if}

			<!-- Результат последнего ответа -->
			{#if gameState.lastResult === 'correct'}
				<div class="result-message correct">✓ Правильно! +10 очков</div>
			{:else if gameState.lastResult === 'wrong'}
				<div class="result-message wrong">✗ Попробуй ещё раз!</div>
			{/if}
		</main>
	{:else}
		<!-- Экран окончания игры -->
		<section class="end-screen">
			<div class="result-card">
				<h2>Игра окончена!</h2>
				<div class="final-score">
					<span class="score-label">Твой счёт:</span>
					<span class="score-value">{gameState.score}</span>
				</div>
				{#if gameState.score === highScores[gameState.difficulty] && gameState.score > 0}
					<div class="new-record">Новый рекорд!</div>
				{/if}
				<div class="stats-summary">
					<p>
						Рекорд ({gameState.difficulty === 'easy' ? 'лёгкий' : 'средний'}):
						<strong>{highScores[gameState.difficulty]} очков</strong>
					</p>
				</div>
				<div class="buttons">
					<button class="btn-primary" onclick={startGame}> 🔄 Играть снова </button>
					<button class="btn-secondary" onclick={resetGame}> 📋 В главное меню </button>
				</div>
			</div>
		</section>
	{/if}
</div>

<style>
</style>
