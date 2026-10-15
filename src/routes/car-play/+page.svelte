<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import * as Blockly from 'blockly';
	import { defineCustomBlocks } from '#lib/blocks';
	import { Interpreter } from '#lib/interpreter';
	import Screen from '#lib/Screen.svelte';

	import Car from '#lib/avatars/Car.svelte';
	import Cat from '#lib/avatars/Cat.svelte';
	import Robot from '#lib/avatars/Robot.svelte';
	import Rocket from '#lib/avatars/Rocket.svelte';
	import Dino from '#lib/avatars/Dino.svelte';

	const GRID_SIZE = 10;

	const avatars = [
		{ id: 'car', name: 'Машинка', component: Car },
		{ id: 'cat', name: 'Кот Коржик', component: Cat },
		{ id: 'robot', name: 'Робот', component: Robot },
		{ id: 'rocket', name: 'Ракета', component: Rocket },
		{ id: 'dino', name: 'Динозаврик', component: Dino }
	];

	let workspace: Blockly.WorkspaceSvg | null = $state(null);
	let blocklyDiv: HTMLDivElement = $state() as HTMLDivElement;
	let robotPosition = $state({ x: 0, y: 5, direction: 'right' });
	let interpreter: Interpreter = $state() as Interpreter;
	let batteries = $state<{ x: number; y: number }[]>([]);
	let score = $state(0);
	let isMobileLayout = $state(false);
	let flyoutSwipe: { pointerId: number; startX: number; startScroll: number } | null = null;

	// Инициализируем из localStorage или берем 'car' по умолчанию
	let selectedAvatarId = $state(localStorage.getItem('kids-coder-avatar') || 'car');

	// В Svelte 5 $derived принимает выражение, а не функцию.
	// Он автоматически отслеживает изменения selectedAvatarId.
	const currentAvatar = $derived(avatars.find((a) => a.id === selectedAvatarId) || avatars[0]);

	// Сохраняем выбор при каждом изменении selectedAvatarId
	$effect(() => {
		localStorage.setItem('kids-coder-avatar', selectedAvatarId);
	});

	function handleKeyDown(event: KeyboardEvent) {
		if (!workspace) return;
		if (event.key === 'Delete' || event.key === 'Backspace') {
			const selected = Blockly.getSelected();
			if (selected && selected instanceof Blockly.Block) {
				selected.dispose(false);
				event.preventDefault();
			}
		}
	}

	function addBattery() {
		const freeCells: { x: number; y: number }[] = [];
		for (let x = 0; x < GRID_SIZE; x++) {
			for (let y = 0; y < GRID_SIZE; y++) {
				if (x === robotPosition.x && y === robotPosition.y) continue;
				if (batteries.some((b) => b.x === x && b.y === y)) continue;
				freeCells.push({ x, y });
			}
		}
		if (freeCells.length === 0) {
			alert('На поле нет свободных клеток!');
			return;
		}
		const randomCell = freeCells[Math.floor(Math.random() * freeCells.length)];
		batteries = [...batteries, randomCell];
	}

	function checkBatteryPickup(x: number, y: number) {
		const batteryIndex = batteries.findIndex((b) => b.x === x && b.y === y);
		if (batteryIndex !== -1) {
			batteries = batteries.filter((_, i) => i !== batteryIndex);
			score += 1;
		}
	}

	function createWorkspace(savedState?: ReturnType<typeof Blockly.serialization.workspaces.save>) {
		workspace?.dispose();
		workspace = Blockly.inject(blocklyDiv, {
			toolbox: {
				kind: 'flyoutToolbox',
				contents: [
					{ kind: 'block', type: 'move_forward' },
					{ kind: 'block', type: 'move_backward' },
					{ kind: 'block', type: 'turn_left' },
					{ kind: 'block', type: 'turn_right' }
				]
			},
			...(isMobileLayout
				? {
						horizontalLayout: true,
						toolboxPosition: 'start',
						zoom: { startScale: 0.78, minScale: 0.5, maxScale: 1.2 }
					}
				: {}),
			scrollbars: true,
			sounds: false,
			trashcan: false,
			move: { scrollbars: true, drag: true, wheel: false }
		});
		if (savedState) Blockly.serialization.workspaces.load(savedState, workspace);
		interpreter = new Interpreter(workspace, (pos) => {
			robotPosition = { ...pos };
			checkBatteryPickup(pos.x, pos.y);
		});
		Blockly.svgResize(workspace);
	}

	function handleViewportChange(event: MediaQueryListEvent) {
		if (event.matches === isMobileLayout || !workspace) return;
		const savedState = Blockly.serialization.workspaces.save(workspace);
		isMobileLayout = event.matches;
		createWorkspace(savedState);
	}

	function handleWindowResize() {
		if (workspace) Blockly.svgResize(workspace);
	}

	function handleFlyoutPointerDown(event: PointerEvent) {
		if (!isMobileLayout || event.pointerType !== 'touch') return;
		const target = event.target;
		if (
			!(target instanceof Element) ||
			(!target.closest('.blocklyFlyout') && !target.closest('.blocklyFlyoutScrollbar'))
		)
			return;
		if (target.closest('.blocklyDraggable')) return;

		const flyoutWorkspace = workspace?.getFlyout()?.getWorkspace();
		const metrics = flyoutWorkspace?.getMetricsManager();
		const view = metrics?.getViewMetrics();
		const scroll = metrics?.getScrollMetrics();
		if (!flyoutWorkspace?.scrollbar || !view || !scroll) return;

		flyoutSwipe = {
			pointerId: event.pointerId,
			startX: event.clientX,
			startScroll: view.left - scroll.left
		};
		event.preventDefault();
		event.stopImmediatePropagation();
		blocklyDiv.setPointerCapture(event.pointerId);
	}

	function handleFlyoutPointerMove(event: PointerEvent) {
		if (!flyoutSwipe || event.pointerId !== flyoutSwipe.pointerId) return;
		const scrollbar = workspace?.getFlyout()?.getWorkspace().scrollbar;
		if (!scrollbar) return;

		scrollbar.setX(flyoutSwipe.startScroll + flyoutSwipe.startX - event.clientX);
		event.preventDefault();
		event.stopImmediatePropagation();
	}

	function handleFlyoutPointerEnd(event: PointerEvent) {
		if (!flyoutSwipe || event.pointerId !== flyoutSwipe.pointerId) return;
		flyoutSwipe = null;
		event.stopImmediatePropagation();
	}

	let mobileMediaQuery: MediaQueryList;

	onMount(() => {
		defineCustomBlocks();
		mobileMediaQuery = window.matchMedia('(max-width: 900px) and (pointer: coarse)');
		isMobileLayout = mobileMediaQuery.matches;
		createWorkspace();
		mobileMediaQuery.addEventListener('change', handleViewportChange);
		window.addEventListener('resize', handleWindowResize);
		window.addEventListener('keydown', handleKeyDown);
		blocklyDiv.addEventListener('pointerdown', handleFlyoutPointerDown, true);
		blocklyDiv.addEventListener('pointermove', handleFlyoutPointerMove, true);
		blocklyDiv.addEventListener('pointerup', handleFlyoutPointerEnd, true);
		blocklyDiv.addEventListener('pointercancel', handleFlyoutPointerEnd, true);
	});

	onDestroy(() => {
		mobileMediaQuery?.removeEventListener('change', handleViewportChange);
		window.removeEventListener('resize', handleWindowResize);
		window.removeEventListener('keydown', handleKeyDown);
		blocklyDiv.removeEventListener('pointerdown', handleFlyoutPointerDown, true);
		blocklyDiv.removeEventListener('pointermove', handleFlyoutPointerMove, true);
		blocklyDiv.removeEventListener('pointerup', handleFlyoutPointerEnd, true);
		blocklyDiv.removeEventListener('pointercancel', handleFlyoutPointerEnd, true);
		workspace?.dispose();
	});

	function runCode() {
		if (interpreter) interpreter.execute();
	}

	function resetRobot() {
		robotPosition = { x: 5, y: 5, direction: 'right' };
		batteries = [];
		score = 0;
		if (interpreter) interpreter.reset();
	}

	function clearWorkspace() {
		if (workspace) workspace.clear();
	}
</script>

<div class="app">
	<header class="app-header">
		<a href="/" class="home-link">← На главную</a>
		<h1>💻 Программное приключение</h1>
		<div class="controls">
			<button onclick={runCode} class="btn btn-primary">▶ Запустить</button>
			<button onclick={resetRobot} class="btn btn-secondary">↺ Сброс</button>
		</div>
	</header>

	<div class="avatar-selector">
		<span class="selector-label">Выбери героя:</span>
		<select class="avatar-select" bind:value={selectedAvatarId} aria-label="Выбери героя для игры">
			{#each avatars as avatar}
				<option value={avatar.id}>{avatar.name}</option>
			{/each}
		</select>
		<div class="avatar-buttons" role="group" aria-label="Выбери героя для игры">
			{#each avatars as avatar}
				<button
					class="avatar-btn"
					class:active={selectedAvatarId === avatar.id}
					onclick={() => (selectedAvatarId = avatar.id)}
					title={avatar.name}
					aria-label={avatar.name}
					aria-pressed={selectedAvatarId === avatar.id}
					type="button"
				>
					<avatar.component class="avatar-preview" />
				</button>
			{/each}
		</div>
	</div>

	<div class="app-main">
		<div class="blockly-area">
			<div bind:this={blocklyDiv} class="blockly-div"></div>
			<button class="custom-trashcan" onclick={clearWorkspace} title="Очистить все блоки">
				<svg
					width="32"
					height="32"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<polyline points="3 6 5 6 21 6"></polyline>
					<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
					></path>
					<line x1="10" y1="11" x2="10" y2="17"></line>
					<line x1="14" y1="11" x2="14" y2="17"></line>
				</svg>
			</button>
		</div>

		<div class="screen-area">
			<Screen
				position={robotPosition}
				{batteries}
				{score}
				onAddBattery={addBattery}
				avatarComponent={currentAvatar.component}
			/>
		</div>
	</div>
</div>
