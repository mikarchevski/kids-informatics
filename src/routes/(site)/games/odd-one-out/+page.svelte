<script lang="ts">
	import { onMount } from 'svelte';
	import './page.css';

	type Difficulty = 'easy' | 'medium' | 'hard';

	interface GameItem {
		id: string;
		emoji: string;
		label: string;
		isOdd: boolean;
	}

	interface Level {
		id: string;
		name: string;
		difficulty: Difficulty;
		items: GameItem[];
		explanation: string;
	}

	interface Progress {
		maxLevelReached: number;
		totalErrors: number;
		completedCount: number;
	}

	const levels: Level[] = [
		{
			id: 'easy-1',
			name: 'Кто где живёт?',
			difficulty: 'easy',
			items: [
				{ id: 'dog', emoji: '🐶', label: 'Собака. Животное', isOdd: false },
				{ id: 'cat', emoji: '🐱', label: 'Кошка. Животное', isOdd: false },
				{ id: 'cow', emoji: '🐮', label: 'Корова. Животное', isOdd: false },
				{ id: 'car', emoji: '🚗', label: 'Машина. Транспорт', isOdd: true }
			],
			explanation: 'Машина лишняя, потому что это транспорт. Собака, кошка и корова — животные.'
		},
		{
			id: 'easy-2',
			name: 'Что можно съесть?',
			difficulty: 'easy',
			items: [
				{ id: 'apple', emoji: '🍎', label: 'Яблоко. Фрукт', isOdd: false },
				{ id: 'banana', emoji: '🍌', label: 'Банан. Фрукт', isOdd: false },
				{ id: 'grapes', emoji: '🍇', label: 'Виноград. Фрукт', isOdd: false },
				{ id: 'shirt', emoji: '👕', label: 'Футболка. Одежда', isOdd: true }
			],
			explanation: 'Футболка лишняя, потому что это одежда. Остальные предметы — фрукты.'
		},
		{
			id: 'easy-3',
			name: 'Найди игрушку',
			difficulty: 'easy',
			items: [
				{ id: 'ball', emoji: '⚽', label: 'Мяч. Игрушка', isOdd: true },
				{ id: 'shoe', emoji: '👟', label: 'Кроссовок. Обувь', isOdd: false },
				{ id: 'hat', emoji: '🧢', label: 'Кепка. Одежда', isOdd: false },
				{ id: 'coat', emoji: '🧥', label: 'Пальто. Одежда', isOdd: false }
			],
			explanation:
				'Мяч лишний, потому что это игрушка. Кроссовок, кепка и пальто — вещи, которые мы носим.'
		},
		{
			id: 'easy-4',
			name: 'Какой транспорт?',
			difficulty: 'easy',
			items: [
				{ id: 'bus', emoji: '🚌', label: 'Автобус. Транспорт', isOdd: false },
				{ id: 'train', emoji: '🚂', label: 'Поезд. Транспорт', isOdd: false },
				{ id: 'plane', emoji: '✈️', label: 'Самолёт. Транспорт', isOdd: false },
				{ id: 'pear', emoji: '🍐', label: 'Груша. Фрукт', isOdd: true }
			],
			explanation: 'Груша лишняя, потому что это фрукт. Автобус, поезд и самолёт — транспорт.'
		},
		{
			id: 'easy-5',
			name: 'Кто умеет летать?',
			difficulty: 'easy',
			items: [
				{ id: 'bird', emoji: '🐦', label: 'Птица. Животное', isOdd: false },
				{ id: 'butterfly', emoji: '🦋', label: 'Бабочка. Насекомое', isOdd: false },
				{ id: 'bee', emoji: '🐝', label: 'Пчела. Насекомое', isOdd: false },
				{ id: 'fish', emoji: '🐟', label: 'Рыба. Животное, живёт в воде', isOdd: true }
			],
			explanation: 'Рыба лишняя, потому что она живёт в воде и не летает. Остальные умеют летать.'
		},
		{
			id: 'medium-1',
			name: 'Фрукты и овощи',
			difficulty: 'medium',
			items: [
				{ id: 'orange', emoji: '🍊', label: 'Апельсин. Фрукт', isOdd: false },
				{ id: 'lemon', emoji: '🍋', label: 'Лимон. Фрукт', isOdd: false },
				{ id: 'strawberry', emoji: '🍓', label: 'Клубника. Фрукт', isOdd: false },
				{ id: 'carrot', emoji: '🥕', label: 'Морковь. Овощ', isOdd: true }
			],
			explanation: 'Морковь лишняя, потому что это овощ. Апельсин, лимон и клубника — фрукты.'
		},
		{
			id: 'medium-2',
			name: 'Что растёт в саду?',
			difficulty: 'medium',
			items: [
				{ id: 'flower', emoji: '🌷', label: 'Тюльпан. Растение', isOdd: false },
				{ id: 'tree', emoji: '🌳', label: 'Дерево. Растение', isOdd: false },
				{ id: 'cactus', emoji: '🌵', label: 'Кактус. Растение', isOdd: false },
				{ id: 'cloud', emoji: '☁️', label: 'Облако. Погода', isOdd: true }
			],
			explanation:
				'Облако лишнее, потому что это явление погоды. Тюльпан, дерево и кактус — растения.'
		},
		{
			id: 'medium-3',
			name: 'Наземный транспорт',
			difficulty: 'medium',
			items: [
				{ id: 'bike', emoji: '🚲', label: 'Велосипед. Наземный транспорт', isOdd: false },
				{ id: 'taxi', emoji: '🚕', label: 'Такси. Наземный транспорт', isOdd: false },
				{ id: 'truck', emoji: '🚚', label: 'Грузовик. Наземный транспорт', isOdd: false },
				{ id: 'boat', emoji: '⛵', label: 'Парусник. Водный транспорт', isOdd: true }
			],
			explanation:
				'Парусник лишний, потому что он ездит по воде. Остальной транспорт движется по земле.'
		},
		{
			id: 'medium-4',
			name: 'Сладкое угощение',
			difficulty: 'medium',
			items: [
				{ id: 'cake', emoji: '🍰', label: 'Торт. Сладость', isOdd: false },
				{ id: 'candy', emoji: '🍬', label: 'Конфета. Сладость', isOdd: false },
				{ id: 'icecream', emoji: '🍦', label: 'Мороженое. Сладость', isOdd: false },
				{ id: 'broccoli', emoji: '🥦', label: 'Брокколи. Овощ', isOdd: true }
			],
			explanation: 'Брокколи лишняя, потому что это овощ. Торт, конфета и мороженое — сладости.'
		},
		{
			id: 'medium-5',
			name: 'Предметы для кухни',
			difficulty: 'medium',
			items: [
				{ id: 'plate', emoji: '🍽️', label: 'Тарелка. Посуда', isOdd: false },
				{ id: 'cup', emoji: '☕', label: 'Чашка. Посуда', isOdd: false },
				{ id: 'spoon', emoji: '🥄', label: 'Ложка. Посуда', isOdd: false },
				{ id: 'puzzle', emoji: '🧩', label: 'Пазл. Игрушка', isOdd: true }
			],
			explanation:
				'Пазл лишний, потому что это игрушка. Тарелка, чашка и ложка — кухонные предметы.'
		},
		{
			id: 'hard-1',
			name: 'Явления погоды',
			difficulty: 'hard',
			items: [
				{ id: 'sun', emoji: '☀️', label: 'Солнце. Погода', isOdd: false },
				{ id: 'rain', emoji: '🌧️', label: 'Дождь. Погода', isOdd: false },
				{ id: 'storm', emoji: '⛈️', label: 'Гроза. Погода', isOdd: false },
				{ id: 'oak', emoji: '🌳', label: 'Дерево. Растение', isOdd: true }
			],
			explanation: 'Дерево лишнее, потому что это растение. Солнце, дождь и гроза — явления погоды.'
		},
		{
			id: 'hard-2',
			name: 'Формы и числа',
			difficulty: 'hard',
			items: [
				{ id: 'circle', emoji: '⚪', label: 'Круг. Фигура', isOdd: false },
				{ id: 'square', emoji: '🟦', label: 'Квадрат. Фигура', isOdd: false },
				{ id: 'triangle', emoji: '🔺', label: 'Треугольник. Фигура', isOdd: false },
				{ id: 'number', emoji: '7️⃣', label: 'Семь. Число', isOdd: true }
			],
			explanation: 'Число семь лишнее, потому что это число. Круг, квадрат и треугольник — фигуры.'
		},
		{
			id: 'hard-3',
			name: 'Времена года',
			difficulty: 'hard',
			items: [
				{ id: 'spring', emoji: '🌸', label: 'Весна. Время года', isOdd: false },
				{ id: 'summer', emoji: '🌻', label: 'Лето. Время года', isOdd: false },
				{ id: 'autumn', emoji: '🍂', label: 'Осень. Время года', isOdd: false },
				{ id: 'snow', emoji: '❄️', label: 'Снег. Погода', isOdd: true }
			],
			explanation: 'Снег лишний, потому что это явление погоды. Весна, лето и осень — времена года.'
		},
		{
			id: 'hard-4',
			name: 'Что сделано человеком?',
			difficulty: 'hard',
			items: [
				{ id: 'house', emoji: '🏠', label: 'Дом. Постройка', isOdd: true },
				{ id: 'mountain', emoji: '⛰️', label: 'Гора. Природа', isOdd: false },
				{ id: 'volcano', emoji: '🌋', label: 'Вулкан. Природа', isOdd: false },
				{ id: 'island', emoji: '🏝️', label: 'Остров. Природа', isOdd: false }
			],
			explanation:
				'Дом лишний, потому что его построил человек. Гора, вулкан и остров созданы природой.'
		},
		{
			id: 'hard-5',
			name: 'Живое и неживое',
			difficulty: 'hard',
			items: [
				{ id: 'rose', emoji: '🌹', label: 'Роза. Живое', isOdd: false },
				{ id: 'tree2', emoji: '🌲', label: 'Ель. Живое', isOdd: false },
				{ id: 'mushroom', emoji: '🍄', label: 'Гриб. Живое', isOdd: false },
				{ id: 'rock', emoji: '🪨', label: 'Камень. Неживое', isOdd: true }
			],
			explanation: 'Камень лишний, потому что он неживой. Роза, ель и гриб — живые организмы.'
		}
	];

	const difficultyLabels: Record<Difficulty, string> = {
		easy: 'Легко',
		medium: 'Средне',
		hard: 'Сложно'
	};
	const storageKey = 'odd-one-out-progress';

	let currentLevelIndex = $state(0);
	let selectedItemId = $state<string | null>(null);
	let result = $state<boolean | null>(null);
	let errors = $state(0);
	let completedCount = $state(0);
	let isFinished = $state(false);
	let explanation = $state<string | null>(null);
	let continuePrompt = $state(false);
	let levelHadError = $state(false);
	let transitionTimer: number | null = null;

	let currentLevel = $derived(levels[currentLevelIndex]);
	let difficulty = $derived(currentLevel.difficulty);

	function saveProgress() {
		localStorage.setItem(
			storageKey,
			JSON.stringify({
				maxLevelReached: currentLevelIndex,
				totalErrors: errors,
				completedCount
			} satisfies Progress)
		);
	}

	function resetSelection() {
		selectedItemId = null;
		result = null;
		explanation = null;
		levelHadError = false;
	}

	function handleItemClick(item: GameItem) {
		if (result === true || isFinished || result === false) return;
		selectedItemId = item.id;

		if (item.isOdd) {
			result = true;
			explanation = currentLevel.explanation;
			if (!levelHadError) completedCount++;
			saveProgress();
			transitionTimer = window.setTimeout(loadNextLevel, 2000);
		} else {
			result = false;
			levelHadError = true;
			errors++;
			saveProgress();
			window.setTimeout(() => {
				result = null;
				selectedItemId = null;
			}, 800);
		}
	}

	function loadNextLevel() {
		transitionTimer = null;
		if (currentLevelIndex === levels.length - 1) {
			isFinished = true;
			saveProgress();
			return;
		}
		currentLevelIndex++;
		resetSelection();
		saveProgress();
	}

	function skipLevel() {
		if (transitionTimer) window.clearTimeout(transitionTimer);
		errors++;
		loadNextLevel();
		saveProgress();
	}

	function restartGame() {
		if (transitionTimer) window.clearTimeout(transitionTimer);
		currentLevelIndex = 0;
		errors = 0;
		completedCount = 0;
		isFinished = false;
		continuePrompt = false;
		resetSelection();
		saveProgress();
	}

	function continueGame() {
		continuePrompt = false;
	}

	onMount(() => {
		try {
			const saved = JSON.parse(localStorage.getItem(storageKey) ?? 'null') as Progress | null;
			if (saved) {
				currentLevelIndex = Math.min(Math.max(saved.maxLevelReached ?? 0, 0), levels.length - 1);
				errors = saved.totalErrors ?? 0;
				completedCount = saved.completedCount ?? 0;
				if (currentLevelIndex > 0) continuePrompt = true;
			}
		} catch {
			localStorage.removeItem(storageKey);
		}
		return () => {
			if (transitionTimer) window.clearTimeout(transitionTimer);
		};
	});
</script>

<svelte:head>
	<title>Найди лишнее — Развивающая игра</title>
	<meta
		name="description"
		content="Найди предмет, который не подходит к остальным, и тренируй логическое мышление."
	/>
</svelte:head>

<div class="odd-game">
	{#if continuePrompt}
		<div class="resume-card" role="dialog" aria-modal="true" aria-labelledby="resume-title">
			<div class="resume-icon" aria-hidden="true">🧩</div>
			<h1 id="resume-title">Продолжить игру?</h1>
			<p>Ты остановился на уровне {currentLevelIndex + 1} из {levels.length}.</p>
			<div class="resume-actions">
				<button class="primary-button" type="button" onclick={continueGame}>▶️ Продолжить</button>
				<button class="secondary-button" type="button" onclick={restartGame}
					>🔄 Начать заново</button
				>
			</div>
		</div>
	{:else if isFinished}
		<section class="finish-card" aria-labelledby="finish-title">
			<div class="finish-icon" aria-hidden="true">🎉</div>
			<h1 id="finish-title">Отлично!</h1>
			<p>Ты прошёл все {levels.length} уровней.</p>
			<div class="stats">
				<span>Ошибок: <strong>{errors}</strong></span><span
					>Без ошибок: <strong>{completedCount}</strong></span
				>
			</div>
			<button class="primary-button" type="button" onclick={restartGame}>🔄 Играть снова</button>
		</section>
	{:else}
		<header class="game-heading">
			<div>
				<p class="eyebrow">Найди лишнее</p>
				<h1>Что здесь не подходит?</h1>
			</div>
			<div class="score" aria-live="polite">
				Уровень {currentLevelIndex + 1} из {levels.length}<br />Ошибок: {errors}
			</div>
		</header>

		<section class="level-info" aria-label="Информация об уровне">
			<span class="difficulty difficulty-{difficulty}">{difficultyLabels[difficulty]}</span>
			<span>{currentLevel.name}</span>
		</section>

		<main>
			<section class="items-grid" aria-label="Выбери лишний предмет">
				{#each currentLevel.items as item (item.id)}
					<button
						class="item-card"
						class:correct={result === true && selectedItemId === item.id}
						class:dimmed={result === true && !item.isOdd}
						class:wrong={result === false && selectedItemId === item.id}
						type="button"
						onclick={() => handleItemClick(item)}
						aria-label={item.label}
					>
						<span aria-hidden="true">{item.emoji}</span>
					</button>
				{/each}
			</section>

			{#if result === false}
				<p class="try-again" role="status">Подумай ещё! Посмотри, что общего у остальных трёх.</p>
			{:else if explanation}
				<div class="explanation" role="status">💬 {explanation}</div>
			{/if}

			<div class="actions">
				<button class="secondary-button" type="button" onclick={restartGame}>🔄 Заново</button>
				<button class="secondary-button skip" type="button" onclick={skipLevel}
					>⏭️ Пропустить</button
				>
			</div>
		</main>
	{/if}
</div>

<style>
</style>
