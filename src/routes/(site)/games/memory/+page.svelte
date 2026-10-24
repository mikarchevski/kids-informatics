<script lang="ts">
	import './page.css';
	import { onMount } from 'svelte';

	// Типы
	type Theme = 'animals' | 'fruits' | 'transport' | 'shapes';
	type Difficulty = 'easy' | 'medium' | 'hard';
	type CardState = 'hidden' | 'flipped' | 'matched';

	interface Card {
		id: number;
		emoji: string;
		theme: Theme;
		state: CardState;
	}

	// Наборы карточек по темам
	const cardThemes: Record<Theme, string[]> = {
		animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮'],
		fruits: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍒', '🍑', '🥝', '🍍'],
		transport: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🚚', '🚜'],
		shapes: ['⭐', '❤️', '💙', '🟢', '🟡', '🟠', '🟣', '💎', '🔶', '🌸', '🌻', '🌈']
	};

	const themeNames: Record<Theme, string> = {
		animals: '🐾 Животные',
		fruits: ' Фрукты',
		transport: '🚗 Транспорт',
		shapes: '⭐ Фигуры'
	};

	const difficulties: Record<Difficulty, { pairs: number; cols: number; label: string }> = {
		easy: { pairs: 6, cols: 4, label: 'Легко (6 пар)' },
		medium: { pairs: 8, cols: 4, label: 'Средне (8 пар)' },
		hard: { pairs: 12, cols: 6, label: 'Сложно (12 пар)' }
	};

	// Состояния игры
	let theme = $state<Theme>('animals');
	let difficulty = $state<Difficulty>('easy');
	let cards = $state<Card[]>([]);
	let flippedCards = $state<Card[]>([]);
	let matchedPairs = $state(0);
	let totalPairs = $state(6);
	let moves = $state(0);
	let isChecking = $state(false);
	let gameState = $state<'ready' | 'playing' | 'finished'>('ready');
	let startTime = $state<number | null>(null);
	let elapsedTime = $state(0);
	let bestTime = $state<number | null>(null);
	let bestMoves = $state<number | null>(null);
	let timerInterval: number | null = null;

	// Перемешивание (Фишер-Йетс)
	function shuffle<T>(array: T[]): T[] {
		const arr = [...array];
		for (let i = arr.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[arr[i], arr[j]] = [arr[j], arr[i]];
		}
		return arr;
	}

	// Инициализация игры
	function initializeGame() {
		const config = difficulties[difficulty];
		totalPairs = config.pairs;
		const emojis = cardThemes[theme].slice(0, config.pairs);

		// Создаём пары
		const pairs = [...emojis, ...emojis];
		const shuffled = shuffle(pairs);

		cards = shuffled.map((emoji, index) => ({
			id: index,
			emoji,
			theme,
			state: 'hidden' as CardState
		}));

		flippedCards = [];
		matchedPairs = 0;
		moves = 0;
		isChecking = false;
		gameState = 'ready';
		startTime = null;
		elapsedTime = 0;

		if (timerInterval) {
			clearInterval(timerInterval);
			timerInterval = null;
		}

		// Загрузка рекордов
		const savedTime = localStorage.getItem(`memory-best-time-${theme}-${difficulty}`);
		const savedMoves = localStorage.getItem(`memory-best-moves-${theme}-${difficulty}`);
		bestTime = savedTime ? parseFloat(savedTime) : null;
		bestMoves = savedMoves ? parseInt(savedMoves) : null;
	}

	// Запуск таймера
	function startTimer() {
		startTime = Date.now();
		timerInterval = window.setInterval(() => {
			elapsedTime = (Date.now() - startTime!) / 1000;
		}, 100);
	}

	function stopTimer() {
		if (timerInterval) {
			clearInterval(timerInterval);
			timerInterval = null;
		}
	}

	// Обработка клика на карточку
	function handleCardClick(card: Card) {
		// Игнорируем клики во время проверки или на открытые/найденные карточки
		if (isChecking || card.state !== 'hidden' || gameState === 'finished') return;
		if (flippedCards.length >= 2) return;

		// Запуск таймера при первом клике
		if (gameState === 'ready') {
			gameState = 'playing';
			startTimer();
		}

		// Переворот карточки
		card.state = 'flipped';
		flippedCards = [...flippedCards, card];

		// Если открыли две карточки — проверяем
		if (flippedCards.length === 2) {
			moves++;
			isChecking = true;
			checkMatch();
		}
	}

	// Проверка совпадения
	function checkMatch() {
		const [card1, card2] = flippedCards;

		if (card1.emoji === card2.emoji) {
			// Совпадение!
			setTimeout(() => {
				card1.state = 'matched';
				card2.state = 'matched';
				matchedPairs++;
				flippedCards = [];
				isChecking = false;

				// Проверка победы
				if (matchedPairs === totalPairs) {
					gameState = 'finished';
					stopTimer();
					saveBestResult();
				}
			}, 500);
		} else {
			// Не совпали — переворачиваем обратно
			setTimeout(() => {
				card1.state = 'hidden';
				card2.state = 'hidden';
				flippedCards = [];
				isChecking = false;
			}, 1000);
		}
	}

	// Сохранение лучшего результата
	function saveBestResult() {
		let isNewRecord = false;

		if (!bestTime || elapsedTime < bestTime) {
			bestTime = elapsedTime;
			localStorage.setItem(`memory-best-time-${theme}-${difficulty}`, elapsedTime.toString());
			isNewRecord = true;
		}

		if (!bestMoves || moves < bestMoves) {
			bestMoves = moves;
			localStorage.setItem(`memory-best-moves-${theme}-${difficulty}`, moves.toString());
			isNewRecord = true;
		}

		if (isNewRecord) {
			// Можно добавить анимацию "Новый рекорд!"
		}
	}

	// Форматирование времени
	function formatTime(seconds: number): string {
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return mins > 0 ? `${mins}м ${secs}с` : `${secs}с`;
	}

	// Обработка смены темы или сложности
	function handleThemeChange() {
		initializeGame();
	}

	function handleDifficultyChange() {
		initializeGame();
	}

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
	<title>Мемори — Найди пару | Тренажёр памяти</title>
	<meta
		name="description"
		content="Игра Мемори (Найди пару) для детей. Развивает память, концентрацию и внимание. Несколько уровней сложности и тем."
	/>
</svelte:head>

<div class="memory-game">
	<header class="game-header">
		<h1>🃏 Мемори — Найди пару</h1>
		<p class="subtitle">Переворачивай карточки и ищи одинаковые пары!</p>
	</header>

	<!-- Панель настроек -->
	<section class="settings-panel" aria-label="Настройки игры">
		<div class="setting-group">
			<label for="theme-select">Тема:</label>
			<select id="theme-select" bind:value={theme} onchange={handleThemeChange}>
				{#each Object.entries(themeNames) as [key, name]}
					<option value={key}>{name}</option>
				{/each}
			</select>
		</div>

		<div class="setting-group">
			<label for="difficulty-select">Сложность:</label>
			<select id="difficulty-select" bind:value={difficulty} onchange={handleDifficultyChange}>
				{#each Object.entries(difficulties) as [key, config]}
					<option value={key}>{config.label}</option>
				{/each}
			</select>
		</div>

		<button class="new-game-button" onclick={initializeGame}> 🔄 Новая игра </button>
	</section>

	<!-- Панель статистики -->
	<section class="stats-panel" aria-label="Статистика">
		<div class="stat-item">
			<span class="stat-label">⏱️ Время</span>
			<span class="stat-value">{formatTime(elapsedTime)}</span>
		</div>
		<div class="stat-item">
			<span class="stat-label">🎯 Ходы</span>
			<span class="stat-value">{moves}</span>
		</div>
		<div class="stat-item">
			<span class="stat-label">✅ Найдено</span>
			<span class="stat-value">{matchedPairs} / {totalPairs}</span>
		</div>
		{#if bestTime !== null}
			<div class="stat-item best">
				<span class="stat-label">🏆 Рекорд</span>
				<span class="stat-value">{formatTime(bestTime)} / {bestMoves} ходов</span>
			</div>
		{/if}
	</section>

	<!-- Игровое поле -->
	<section class="game-board" aria-label="Игровое поле">
		<div
			class="cards-grid"
			style="grid-template-columns: repeat({difficulties[difficulty].cols}, 1fr);"
		>
			{#each cards as card (card.id)}
				<button
					class="card"
					class:flipped={card.state === 'flipped'}
					class:matched={card.state === 'matched'}
					class:hidden={card.state === 'hidden'}
					onclick={() => handleCardClick(card)}
					disabled={card.state !== 'hidden' || isChecking}
					aria-label={card.state === 'hidden' ? 'Закрытая карточка' : `Карточка ${card.emoji}`}
				>
					<div class="card-inner">
						<div class="card-front">
							<div class="emoji-wrapper">
								<span class="card-emoji">{card.emoji}</span>
							</div>
						</div>
						<div class="card-back">
							<span class="card-back-icon">❓</span>
						</div>
					</div>
				</button>
			{/each}
		</div>
	</section>

	<!-- Сообщение о победе -->
	{#if gameState === 'finished'}
		<div class="victory-message" role="alert">
			<h2>Победа!</h2>
			<p>
				Ты нашёл все пары за <strong>{formatTime(elapsedTime)}</strong> и
				<strong>{moves} ходов</strong>!
			</p>
			{#if bestTime === elapsedTime || bestMoves === moves}
				<p class="new-record">🏆 Новый рекорд!</p>
			{/if}
			<button class="play-again-button" onclick={initializeGame}> Играть ещё раз </button>
		</div>
	{/if}

	<!-- Инструкции -->
	<section class="instructions">
		<h3>📖 Как играть</h3>
		<ol>
			<li>Все карточки лежат рубашкой вверх</li>
			<li>Нажми на любую карточку — она перевернётся</li>
			<li>Нажми на вторую карточку</li>
			<li>Если картинки совпали — они остаются открытыми</li>
			<li>Если не совпали — обе переворачиваются обратно</li>
			<li>Запомни расположение карточек и найди все пары!</li>
		</ol>
		<p class="tip">
			💡 <strong>Совет:</strong> Старайся запоминать, где какие картинки. Чем меньше ходов — тем лучше
			результат!
		</p>
	</section>
</div>

<style>
</style>
