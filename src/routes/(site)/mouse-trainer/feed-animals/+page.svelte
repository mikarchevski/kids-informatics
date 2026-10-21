<script lang="ts">
	import './page.css';

	type FoodId = 'carrot' | 'bone' | 'fish' | 'bamboo' | 'banana' | 'cheese';
	type Animal = {
		id: string;
		name: string;
		icon: string;
		food: FoodId;
		menuSide: 'left' | 'right';
	};
	type Food = { id: FoodId; name: string; icon: string };

	const animals: Animal[] = [
		{ id: 'rabbit', name: 'Зайчик', icon: '🐰', food: 'carrot', menuSide: 'left' },
		{ id: 'dog', name: 'Собачка', icon: '🐶', food: 'bone', menuSide: 'left' },
		{ id: 'cat', name: 'Котик', icon: '🐱', food: 'fish', menuSide: 'left' },
		{ id: 'panda', name: 'Панда', icon: '🐼', food: 'bamboo', menuSide: 'right' },
		{ id: 'monkey', name: 'Обезьянка', icon: '🐵', food: 'banana', menuSide: 'left' },
		{ id: 'mouse', name: 'Мышка', icon: '🐭', food: 'cheese', menuSide: 'right' }
	];

	const foods: Food[] = [
		{ id: 'carrot', name: 'Морковка', icon: '🥕' },
		{ id: 'bone', name: 'Косточка', icon: '🦴' },
		{ id: 'fish', name: 'Рыбка', icon: '🐟' },
		{ id: 'bamboo', name: 'Бамбук', icon: '🎋' },
		{ id: 'banana', name: 'Банан', icon: '🍌' },
		{ id: 'cheese', name: 'Сыр', icon: '🧀' }
	];

	let fedAnimalIds = $state<string[]>([]);
	let activeAnimalId = $state<string | null>(null);
	let feedbackAnimal = $state<string | null>(null);
	let isComplete = $state(false);

	const progress = $derived((fedAnimalIds.length / animals.length) * 100);

	function handleContextMenu(event: MouseEvent, animalId: string) {
		event.preventDefault();
		if (!fedAnimalIds.includes(animalId)) activeAnimalId = animalId;
	}

	function handleOutsidePointerDown(event: PointerEvent) {
		if (!(event.target instanceof Element) || !event.target.closest('.food-menu')) {
			activeAnimalId = null;
		}
	}

	function chooseFood(animal: Animal, food: Food) {
		activeAnimalId = null;

		if (food.id !== animal.food) {
			feedbackAnimal = animal.name;
			return;
		}

		if (fedAnimalIds.includes(animal.id)) return;
		fedAnimalIds = [...fedAnimalIds, animal.id];

		if (fedAnimalIds.length === animals.length) isComplete = true;
	}

	function resetGame() {
		fedAnimalIds = [];
		activeAnimalId = null;
		feedbackAnimal = null;
		isComplete = false;
	}

	function closeFeedback() {
		feedbackAnimal = null;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key !== 'Escape') return;
		activeAnimalId = null;
		feedbackAnimal = null;
	}
</script>

<svelte:head>
	<title>Накорми животных — Kids Informatics</title>
	<meta
		name="description"
		content="Выбери подходящую еду для каждого животного и помоги накормить всех!"
	/>
</svelte:head>

<svelte:window onkeydown={handleKeydown} onpointerdown={handleOutsidePointerDown} />

<main class="game-page">
	<div class="feed-game-card">
		<header class="game-heading">
			<h1><span aria-hidden="true">🐰</span> Покорми всех животных!</h1>
			<p class="feed-score" aria-live="polite">{fedAnimalIds.length} / {animals.length}</p>
		</header>

		<div
			class="progress-track"
			role="progressbar"
			aria-label="Накормленные животные"
			aria-valuemin={0}
			aria-valuemax={animals.length}
			aria-valuenow={fedAnimalIds.length}
		>
			<div class="feed-progress-fill" style={`width: ${progress}%`}></div>
		</div>

		<section class="animal-board" aria-label="Животные">
			{#each animals as animal (animal.id)}
				{@const isFed = fedAnimalIds.includes(animal.id)}
				<div
					class="animal-slot"
					class:menu-on-left={animal.menuSide === 'right'}
					class:has-menu={activeAnimalId === animal.id}
				>
					<button
						class="animal-card"
						class:fed={isFed}
						oncontextmenu={(event) => handleContextMenu(event, animal.id)}
						aria-label={isFed ? `${animal.name}, накормлен` : `${animal.name}, открыть список еды`}
						aria-expanded={!isFed && activeAnimalId === animal.id}
						aria-haspopup="menu"
						type="button"
						disabled={isFed}
					>
						<span class="animal-icon" aria-hidden="true">{animal.icon}</span>
						<span class="animal-name">{animal.name}</span>
						{#if isFed}
							<span class="fed-status"><span aria-hidden="true">✓</span> Наелся</span>
						{/if}
					</button>

					{#if activeAnimalId === animal.id}
						<div class="food-menu" role="menu" aria-label={`Чем покормить: ${animal.name}`}>
							<h2>Чем покормить {animal.name}?</h2>
							{#each foods as food (food.id)}
								<button
									class="food-option"
									class:correct-option={food.id === animal.food}
									onclick={() => chooseFood(animal, food)}
									role="menuitem"
									type="button"
								>
									<span aria-hidden="true">{food.icon}</span>
									<span>{food.name}</span>
								</button>
							{/each}
						</div>
					{/if}
				</div>
			{/each}
			{#if isComplete}
				<div class="feed-win-overlay">
					<div class="feed-win-content">
						<span class="feed-win-icon" aria-hidden="true">🎉</span>
						<h2>Ура! Все животные накормлены!</h2>
						<p>Ты помог накормить всех {animals.length} животных. Отличная работа!</p>
						<button class="feed-repeat-button" onclick={resetGame} type="button">
							<span aria-hidden="true">🔄</span>
							Сыграть ещё раз
						</button>
					</div>
				</div>
			{/if}
		</section>

		<p class="game-instruction">
			<span aria-hidden="true">ⓘ</span> Нажми <strong>правой кнопкой</strong> на животное и выбери правильную
			еду
		</p>
		<div class="back-section">
			<a class="back-btn" href="/mouse-trainer">← Назад к играм</a>
		</div>
	</div>
</main>

{#if feedbackAnimal}
	<div class="modal-backdrop">
		<div
			class="result-modal"
			role="alertdialog"
			aria-modal="true"
			aria-labelledby="result-title"
			tabindex="-1"
		>
			<span class="result-icon" aria-hidden="true">🤔</span>
			<h2 id="result-title">{feedbackAnimal} такое не ест</h2>
			<p>Попробуй выбрать для него другую еду.</p>
			<button class="modal-primary" onclick={closeFeedback} type="button">Понятно</button>
		</div>
	</div>
{/if}
