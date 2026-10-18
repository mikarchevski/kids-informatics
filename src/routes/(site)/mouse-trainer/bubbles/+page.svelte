<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount, onDestroy } from 'svelte';
  import './page.css';

	interface Bubble {
		id: number;
		x: number;
		y: number;
		color: string;
		size: number;
	}

	const TOTAL_TO_POP = 15;
	const MAX_BUBBLES = 8;
	const INITIAL_BUBBLES = 5;
	const ADD_INTERVAL = 10000; // 10 секунд

	let bubbles = $state<Bubble[]>([]);
	let poppedCount = $state(0);
	let gameWon = $state(false);
	let bubbleIdCounter = 0;
	let addInterval: ReturnType<typeof setInterval> | null = null;

	const bubbleColors = [
		'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // фиолетовый
		'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', // розовый
		'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', // голубой
		'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', // зелёный
		'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', // оранжево-розовый
		'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', // тёмно-синий
		'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', // светло-розовый
		'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'  // персиковый
	];

	function getRandomPosition(size: number) {
		// Оставляем отступы от краёв (примерно 10% с каждой стороны)
		const minX = 10;
		const maxX = 90 - size / 8;
		const minY = 10;
		const maxY = 90 - size / 8;
		
		return {
			x: Math.random() * (maxX - minX) + minX,
			y: Math.random() * (maxY - minY) + minY
		};
	}

	function createBubble(): Bubble {
		const size = 80 + Math.random() * 40; // 80-120px
		const pos = getRandomPosition(size);
		const color = bubbleColors[Math.floor(Math.random() * bubbleColors.length)];
		
		return {
			id: bubbleIdCounter++,
			x: pos.x,
			y: pos.y,
			color,
			size
		};
	}

	function addBubble() {
		if (bubbles.length < MAX_BUBBLES && !gameWon) {
			bubbles = [...bubbles, createBubble()];
		}
	}

	function popBubble(bubbleId: number) {
		if (gameWon) return;
		
		// Удаляем лопнувший пузырь
		bubbles = bubbles.filter(b => b.id !== bubbleId);
		poppedCount++;
		
		// Если ещё не достигли цели, добавляем новый пузырь
		if (poppedCount < TOTAL_TO_POP && bubbles.length < MAX_BUBBLES) {
			// Небольшая задержка перед появлением нового для лучшего UX
			setTimeout(() => {
				if (!gameWon && bubbles.length < MAX_BUBBLES) {
					bubbles = [...bubbles, createBubble()];
				}
			}, 100);
		}
		
		// Проверяем победу
		if (poppedCount >= TOTAL_TO_POP) {
			gameWon = true;
			if (addInterval) {
				clearInterval(addInterval);
			}
		}
	}

	function startGame() {
		bubbles = [];
		poppedCount = 0;
		gameWon = false;
		bubbleIdCounter = 0;
		
		// Создаём начальные 5 пузырьков
		for (let i = 0; i < INITIAL_BUBBLES; i++) {
			setTimeout(() => {
				addBubble();
			}, i * 200); // Небольшая задержка между появлением для красоты
		}
		
		// Устанавливаем интервал добавления пузырьков каждые 10 секунд
		addInterval = setInterval(() => {
			addBubble();
		}, ADD_INTERVAL);
	}

	function resetGame() {
		if (addInterval) {
			clearInterval(addInterval);
		}
		startGame();
	}

	onMount(() => {
		startGame();
	});

	onDestroy(() => {
		if (addInterval) {
			clearInterval(addInterval);
		}
	});

	function goBack() {
		if (addInterval) {
			clearInterval(addInterval);
		}
		goto('/mouse-trainer');
	}
</script>

<svelte:head>
	<title>Ломай пузырьки - Тренажёр мышки</title>
</svelte:head>

<div class="game-page">
	<div class="game-container">
		<!-- Шапка игры -->
		<div class="game-header">
			<div class="header-left">
				<span class="header-icon"></span>
				<h1>Ломай пузырьки левой кнопкой мыши!</h1>
			</div>
			<div class="score">
				<span class="score-number">{poppedCount}</span>
				<span class="score-text">из {TOTAL_TO_POP}</span>
			</div>
		</div>

		<!-- Прогресс бар -->
		<div class="progress-container">
			<div class="progress-bar">
				<div 
					class="progress-fill" 
					style="width: {(poppedCount / TOTAL_TO_POP) * 100}%"
				></div>
			</div>
		</div>

		<!-- Игровое поле -->
		<div class="game-field">
			{#each bubbles as bubble (bubble.id)}
				<div
					class="bubble"
					class:popping={false}
					style="
						left: {bubble.x}%;
						top: {bubble.y}%;
						width: {bubble.size}px;
						height: {bubble.size}px;
						background: {bubble.color};
						animation-delay: {bubble.id * 0.05}s
					"
					onclick={() => popBubble(bubble.id)}
					role="button"
					aria-label="Пузырёк"
				>
					<div class="bubble-highlight"></div>
				</div>
			{/each}

			<!-- Экран победы -->
			{#if gameWon}
				<div class="win-overlay">
					<div class="win-content">
						<div class="win-icon">🎉</div>
						<h2>Ура! Ты лопнул все пузыри!</h2>
						<p>Отличная работа! Ты отлично освоил левую кнопку мыши!</p>
						<button class="repeat-btn" onclick={resetGame}>
							<span>🔄</span>
							Повторить
						</button>
					</div>
				</div>
			{/if}
		</div>

		<!-- Подсказка -->
		<div class="hint">
			<span class="hint-icon">ⓘ</span>
			<span>Нажимай на пузырьки левой кнопкой мыши</span>
		</div>

		<!-- Кнопка назад -->
		<div class="back-section">
			<button class="back-btn" onclick={goBack}>
				← Назад к играм
			</button>
		</div>
	</div>
</div>

<style>
	
</style>