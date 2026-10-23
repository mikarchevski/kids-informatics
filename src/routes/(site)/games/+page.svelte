<script lang="ts">
	import { games } from '#lib/data/games';
	import './page.css';

	// Фильтры
	let selectedAge = $state<number | null>(null);
	let selectedCategory = $state<string | null>(null);

	// Фильтрация игр
	const filteredGames = $derived(
		games.filter((game) => {
			const ageMatch =
				!selectedAge || (game.ageRange.min <= selectedAge && game.ageRange.max >= selectedAge);
			const categoryMatch = !selectedCategory || game.category === selectedCategory;
			return ageMatch && categoryMatch && game.isAvailable;
		})
	);

	// Категории для фильтров
	const categories = [
		{ value: 'logic', label: 'Логика', icon: '🧠' },
		{ value: 'math', label: 'Математика', icon: '🔢' },
		{ value: 'reading', label: 'Чтение', icon: '📖' },
		{ value: 'attention', label: 'Внимание', icon: '👁️' },
		{ value: 'spatial', label: 'Пространство', icon: '🗺️' }
	];

	// Возрастные группы
	const ageGroups = [
		{ value: 4, label: '3-6 лет' },
		{ value: 7, label: '6-9 лет' },
		{ value: 10, label: '9-12 лет' },
		{ value: 13, label: '12+ лет' }
	];
</script>

<!-- 
<svelte:head>
	<title>Развивающие игры для детей | Каталог</title>
	<meta
		name="description"
		content="Бесплатные онлайн-игры для развития логики, математики, внимания и чтения у детей от 3 до 14 лет."
	/>
</svelte:head> -->

<div class="games-catalog">
	<header class="catalog-header">
		<div class="catalog-header__title">🎮 Развивающие игры</div>
		<p class="subtitle">Интерактивные тренажёры для детей от 3 до 14 лет</p>
	</header>

	<!-- Фильтры -->
	<section class="filters" aria-label="Фильтры игр">
		<div class="filter-group">
			<label for="age-filter">Возраст:</label>
			<select id="age-filter" bind:value={selectedAge}>
				<option value={null}>Все возрасты</option>
				{#each ageGroups as group}
					<option value={group.value}>{group.label}</option>
				{/each}
			</select>
		</div>

		<div class="filter-group">
			<label>Категория:</label>
			<div class="category-buttons">
				<button class:active={selectedCategory === null} onclick={() => (selectedCategory = null)}>
					Все
				</button>
				{#each categories as cat}
					<button
						class:active={selectedCategory === cat.value}
						onclick={() => (selectedCategory = cat.value)}
					>
						{cat.icon}
						{cat.label}
					</button>
				{/each}
			</div>
		</div>
	</section>

	<!-- Сетка игр -->
	<section class="games-grid" aria-label="Список доступных игр">
		{#if filteredGames.length === 0}
			<div class="no-results">
				<p>😔 Игр по выбранным фильтрам пока нет</p>
				<button
					onclick={() => {
						selectedAge = null;
						selectedCategory = null;
					}}
				>
					Сбросить фильтры
				</button>
			</div>
		{:else}
			{#each filteredGames as game (game.id)}
				<a href="/games/{game.slug}" class="game-card">
					<div class="game-icon">{game.icon}</div>
					<div class="game-info">
						<h2>{game.title}</h2>
						<p class="game-description">{game.description}</p>
						<div class="game-meta">
							<span class="age-badge">👶 {game.ageRange.min}-{game.ageRange.max} лет</span>
							<span class="time-badge">⏱️ {game.estimatedTime}</span>
							<span class="difficulty-badge difficulty-{game.difficulty}">
								{game.difficulty === 'easy'
									? '🟢 Легко'
									: game.difficulty === 'medium'
										? '🟡 Средне'
										: '🔴 Сложно'}
							</span>
						</div>
					</div>
				</a>
			{/each}
		{/if}
	</section>
</div>

<style>
</style>
