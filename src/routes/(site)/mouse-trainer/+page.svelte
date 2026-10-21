<script lang="ts">
	import Seo from '#lib/components/Seo.svelte';
	import './page.css';
	const games = [
		{
			id: 'bubbles',
			title: 'Левый клик',
			desc: 'Учимся нажимать левую кнопку мыши',
			icon: '🔵',
			color: '#4ade80'
		},
		{
			id: 'feed-animals',
			title: 'Правый клик',
			desc: 'Учимся нажимать правую кнопку мыши',
			icon: '🐰',
			color: '#f472b6'
		},
		{
			id: 'double-click',
			title: 'Двойной клик',
			desc: 'Тренируем быстрый двойной щелчок',
			icon: '📦',
			color: '#fbbf24'
		},
		{
			id: 'drag',
			title: 'Перетаскивание',
			desc: 'Учимся захватывать и перемещать объекты',
			icon: '🎨',
			color: '#a78bfa'
		},
		{
			id: 'scroll',
			title: 'Прокрутка',
			desc: 'Тренируем использование колесика мыши',
			icon: '🏴‍☠️',
			color: '#34d399'
		},
		{
			id: 'aim',
			title: 'Точность',
			desc: 'Попадаем курсором в маленькие цели',
			icon: '🎯',
			color: '#f87171'
		}
	];
</script>

<Seo
	title="Тренажёр мышки для детей: учимся играть и кликать"
	description="Бесплатные игры для тренировки мыши: клики, двойной клик, перетаскивание, прокрутка и точность курсора."
	path="/mouse-trainer"
/>

<div class="trainer-page">
	<h1 class="trainer-page__title">Тренажёр мышки</h1>
	<p class="subtitle">Выбери игру и начни тренировку!</p>

	<div class="games-grid">
		{#each games as game}
			<a href={`/mouse-trainer/${game.id}`} class="game-card" style="--card-color: {game.color}">
				<div class="game-icon">{game.icon}</div>
				<h2>{game.title}</h2>
				<p>{game.desc}</p>
				<span class="play-btn">Играть ▶</span>
			</a>
		{/each}
	</div>
</div>

<style>
</style>
