<script lang="ts">
	import './app.css';
	import { onMount } from 'svelte';

	let { children } = $props();

	const COUNTER_ID = 113829616;
	let initialized = false;
	let currentPath = '';

	// Функция для инициализации и отправки hit
	function initMetrika() {
		if (typeof window === 'undefined') return;

		if (!(window as any).ym) {
			(function (m: Window, e: Document, t: string, r: string, i: string) {
				(m as any)[i] =
					(m as any)[i] ||
					function () {
						((m as any)[i].a = (m as any)[i].a || []).push(arguments);
					};
				(m as any)[i].l = Date.now(); // Исправлено: используем Date.now() вместо 1 * new Date()
				for (let j = 0; j < e.scripts.length; j++) {
					if (e.scripts[j].src === r) return;
				}
				const k = e.createElement(t) as HTMLScriptElement;
				const a = e.getElementsByTagName(t)[0];
				k.async = true;
				k.src = r;
				a.parentNode!.insertBefore(k, a);
			})(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');

			(window as any).ym(COUNTER_ID, 'init', {
				defer: true,
				ssr: false, // Обычное Svelte приложение, не SSR
				clickmap: true,
				ecommerce: 'dataLayer',
				accurateTrackBounce: true,
				trackLinks: true,
				webvisor: true
			});
		}

		// Отправляем hit с текущим путём
		const path = window.location.pathname + window.location.search;
		(window as any).ym(COUNTER_ID, 'hit', path);
	}

	onMount(() => {
		// Инициализируем при первой загрузке
		initMetrika();
		initialized = true;
		currentPath = window.location.pathname;

		// Отслеживаем изменения URL (для client-side роутинга)
		const observer = new MutationObserver(() => {
			const newPath = window.location.pathname;
			if (newPath !== currentPath) {
				currentPath = newPath;
				if ((window as any).ym) {
					(window as any).ym(COUNTER_ID, 'hit', newPath + window.location.search);
				}
			}
		});

		// Наблюдаем за изменениями в DOM (простой способ отследить переходы)
		observer.observe(document.body, {
			childList: true,
			subtree: true
		});

		// Альтернативно: слушаем событие popstate (для history API)
		const handlePopState = () => {
			const newPath = window.location.pathname;
			if (newPath !== currentPath) {
				currentPath = newPath;
				if ((window as any).ym) {
					(window as any).ym(COUNTER_ID, 'hit', newPath + window.location.search);
				}
			}
		};
		window.addEventListener('popstate', handlePopState);

		return () => {
			observer.disconnect();
			window.removeEventListener('popstate', handlePopState);
		};
	});

	function updateViewportHeight() {
		const vh = window.innerHeight * 0.01;
		document.documentElement.style.setProperty('--vh', `${vh}px`);
	}

	onMount(() => {
		updateViewportHeight();
		window.addEventListener('resize', updateViewportHeight);
		window.addEventListener('orientationchange', updateViewportHeight);

		return () => {
			window.removeEventListener('resize', updateViewportHeight);
			window.removeEventListener('orientationchange', updateViewportHeight);
		};
	});
</script>

<div class="app-container">
	{@render children()}
</div>
