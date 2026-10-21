<script lang="ts">
	import Seo from '#lib/components/Seo.svelte';
	import './page.css';

	type CategoryId = 'fruits' | 'toys' | 'transport';
	type Category = { id: CategoryId; name: string; icon: string };
	type Item = {
		id: string;
		name: string;
		icon: string;
		category: CategoryId;
	};
	type DragPosition = { x: number; y: number };

	const categories: Category[] = [
		{ id: 'fruits', name: 'Фрукты', icon: '🍎' },
		{ id: 'toys', name: 'Игрушки', icon: '🧸' },
		{ id: 'transport', name: 'Транспорт', icon: '🚗' }
	];

	const initialItems: Item[] = [
		{ id: 'apple', name: 'Яблоко', icon: '🍎', category: 'fruits' },
		{ id: 'teddy', name: 'Мишка', icon: '🧸', category: 'toys' },
		{ id: 'car', name: 'Машинка', icon: '🚗', category: 'transport' },
		{ id: 'banana', name: 'Банан', icon: '🍌', category: 'fruits' },
		{ id: 'plane', name: 'Самолёт', icon: '✈️', category: 'transport' },
		{ id: 'gamepad', name: 'Игровая приставка', icon: '🎮', category: 'toys' },
		{ id: 'orange', name: 'Апельсин', icon: '🍊', category: 'fruits' },
		{ id: 'train', name: 'Паровоз', icon: '🚂', category: 'transport' },
		{ id: 'palette', name: 'Палитра', icon: '🎨', category: 'toys' },
		{ id: 'grapes', name: 'Виноград', icon: '🍇', category: 'fruits' },
		{ id: 'ball', name: 'Футбольный мяч', icon: '⚽', category: 'toys' },
		{ id: 'rocket', name: 'Ракета', icon: '🚀', category: 'transport' }
	];

	let remainingItems = $state<Item[]>([...initialItems]);
	let placedItems = $state<Record<CategoryId, Item[]>>({
		fruits: [],
		toys: [],
		transport: []
	});
	let draggedItem = $state<Item | null>(null);
	let dragPosition = $state<DragPosition>({ x: 0, y: 0 });
	let mismatch = $state<{ item: string; category: string } | null>(null);
	let isComplete = $state(false);

	const totalItems = initialItems.length;
	const placedCount = $derived(totalItems - remainingItems.length);
	const progress = $derived((placedCount / totalItems) * 100);

	function startDrag(event: PointerEvent, item: Item) {
		if (event.button !== 0 || !event.isPrimary) return;

		event.preventDefault();
		draggedItem = item;
		dragPosition = { x: event.clientX, y: event.clientY };
	}

	function moveDrag(event: PointerEvent) {
		if (!draggedItem) return;
		dragPosition = { x: event.clientX, y: event.clientY };
	}

	function finishDrag(event: PointerEvent) {
		if (event.button !== 0 || !draggedItem) return;

		const item = draggedItem;
		const target = document.elementFromPoint(event.clientX, event.clientY);
		const categoryElement = target?.closest<HTMLElement>('[data-category]');
		const categoryId = categoryElement?.dataset.category as CategoryId | undefined;
		draggedItem = null;

		if (!categoryId) return;

		const category = categories.find((entry) => entry.id === categoryId);
		if (!category) return;

		if (item.category !== category.id) {
			mismatch = { item: item.name, category: category.name.toLowerCase() };
			return;
		}

		remainingItems = remainingItems.filter((entry) => entry.id !== item.id);
		placedItems = {
			...placedItems,
			[category.id]: [...placedItems[category.id], item]
		};

		if (remainingItems.length === 0) isComplete = true;
	}

	function closeMismatch() {
		mismatch = null;
	}

	function resetGame() {
		remainingItems = [...initialItems];
		placedItems = { fruits: [], toys: [], transport: [] };
		draggedItem = null;
		mismatch = null;
		isComplete = false;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') mismatch = null;
	}
</script>

<Seo
	title="Игра на перетаскивание мышью: сортировка предметов"
	description="Перетаскивай фрукты, игрушки и транспорт в подходящие категории, тренируя управление мышью."
	path="/mouse-trainer/drag"
/>

<svelte:window
	onpointermove={moveDrag}
	onpointerup={finishDrag}
	onpointercancel={() => (draggedItem = null)}
	onkeydown={handleKeydown}
/>

<div class="game-page">
	<div class="drag-game-card">
		<header class="drag-game-heading">
			<h1><span aria-hidden="true">🎨</span> Разложи предметы по категориям!</h1>
			<p class="drag-game-score" aria-live="polite">{placedCount} / {totalItems}</p>
		</header>

		<div
			class="drag-game-progress"
			role="progressbar"
			aria-label="Разложенные предметы"
			aria-valuemin={0}
			aria-valuemax={totalItems}
			aria-valuenow={placedCount}
		>
			<div class="drag-game-progress-fill" style={`width: ${progress}%`}></div>
		</div>

		<section class="drag-items-area" aria-label="Предметы для сортировки">
			<h2>Перетащи предметы в нужные корзины 👇</h2>
			<div class="drag-items-grid">
				{#each remainingItems as item (item.id)}
					<button
						class="drag-item"
						class:drag-item-hidden={draggedItem?.id === item.id}
						onpointerdown={(event) => startDrag(event, item)}
						oncontextmenu={(event) => event.preventDefault()}
						aria-label={`${item.name}. Перетащи в подходящую категорию`}
						type="button"
					>
						<span aria-hidden="true">{item.icon}</span>
						<span class="drag-item-name">{item.name}</span>
					</button>
				{/each}
			</div>
		</section>

		<section class="drag-categories" aria-label="Категории">
			{#each categories as category (category.id)}
				<div
					class={`drag-category drag-category-${category.id}`}
					data-category={category.id}
					aria-label={category.name}
				>
					<header class="drag-category-heading">
						<span aria-hidden="true">{category.icon}</span>
						<h2>{category.name}</h2>
					</header>
					<div class="drag-category-items" aria-live="polite">
						{#each placedItems[category.id] as item (item.id)}
							<span class="drag-placed-item" aria-label={item.name} title={item.name}>
								{item.icon}
							</span>
						{/each}
					</div>
					<p class="drag-category-count">{placedItems[category.id].length} предмет(ов)</p>
				</div>
			{/each}
			{#if isComplete}
				<div class="drag-win-overlay">
					<div class="drag-win-content">
						<span class="drag-win-icon" aria-hidden="true">🎉</span>
						<h2>Ура! Все предметы на своих местах!</h2>
						<p>Ты разложил все {totalItems} предметов по категориям. Отличная работа!</p>
						<button class="drag-win-repeat" onclick={resetGame} type="button">
							<span aria-hidden="true">🔄</span>
							Сыграть ещё раз
						</button>
					</div>
				</div>
			{/if}
		</section>

		<div class="drag-back-section">
			<a class="drag-back-button" href="/mouse-trainer">← Назад к играм</a>
		</div>
	</div>
</div>

{#if draggedItem}
	<div
		class="drag-preview"
		style={`left: ${dragPosition.x}px; top: ${dragPosition.y}px`}
		aria-hidden="true"
	>
		{draggedItem.icon}
	</div>
{/if}

{#if mismatch}
	<div class="drag-modal-backdrop">
		<div
			class="drag-result-modal"
			role="alertdialog"
			aria-modal="true"
			aria-labelledby="drag-result-title"
			tabindex="-1"
		>
			<span class="drag-result-icon" aria-hidden="true">🤔</span>
			<h2 id="drag-result-title">{mismatch.item} не {mismatch.category}</h2>
			<button class="drag-modal-primary" onclick={closeMismatch} type="button">Понятно</button>
		</div>
	</div>
{/if}
