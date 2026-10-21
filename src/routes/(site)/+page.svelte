<script lang="ts">
	import Seo from '#lib/components/Seo.svelte';
	import './home.css';
</script>

<Seo
	title="Программирование и логика для детей — Kids Informatics"
	description="Бесплатные детские игры и занятия по программированию: изучайте алгоритмы и логику в интерактивных заданиях для детей от 5 лет."
	path="/"
/>

<div class="home">
	<!-- Шапка сайта -->

	<!-- Главный баннер -->
	<section class="hero">
		<div class="hero-inner">
			<h1 class="hero-title">Учим программировать через&nbsp;игру</h1>
			<p class="hero-subtitle">
				Интерактивная платформа, где дети от 6 лет осваивают основы алгоритмов, логики и
				последовательного мышления — без скучных лекций.
			</p>
			<a href="/car-play" class="btn-hero">Начать играть →</a>
		</div>
	</section>

	<!-- Основной контент: сайдбар + новости -->
	<div class="content-wrapper">
		<!-- Левое меню -->

		<!-- Центральная часть с новостями -->
		<div class="main-content">
			<h2 class="section-title">Учимся в игре и читаем о технологиях</h2>

			<div class="news-list">
				<article class="news-card">
					<h3 class="news-title">Первые шаги в алгоритмах</h3>
					<p class="news-excerpt">
						Собирай команды из блоков и помогай персонажу выполнить задание в программном
						приключении.
					</p>
					<a href="/car-play" class="news-link">Начать игру →</a>
				</article>
				<article class="news-card">
					<h3 class="news-title">Игры для тренировки мыши</h3>
					<p class="news-excerpt">
						Практикуй клики, перетаскивание и прокрутку в коротких интерактивных заданиях.
					</p>
					<a href="/mouse-trainer" class="news-link">Выбрать тренажёр →</a>
				</article>
				<article class="news-card">
					<h3 class="news-title">Статьи о логике и программировании</h3>
					<p class="news-excerpt">
						Читайте познавательные материалы о технологиях, алгоритмах и развитии логического
						мышления.
					</p>
					<a href="/articles" class="news-link">Перейти к статьям →</a>
				</article>
			</div>
		</div>
	</div>
</div>
