<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import * as Blockly from 'blockly';
	import { defineCustomBlocks } from '#lib/blocks';
	import { Interpreter } from '#lib/interpreter';
	import Screen from '#lib/Screen.svelte';

	import Car from '#lib/avatars/Car.svelte';
	import Cat from '#lib/avatars/Cat.svelte';
	import Robot from '#lib/avatars/Robot.svelte';
	import Rocket from '#lib/avatars/Rocket.svelte';
	import Dino from '#lib/avatars/Dino.svelte';

	type CommandType = 'move_forward' | 'move_backward' | 'turn_left' | 'turn_right';
	type ProgramCommand = { id: string; type: CommandType };

	const DESKTOP_GRID_SIZE = 10;
	const MOBILE_GRID_SIZE = 8;

	const avatars = [
		{ id: 'car', name: 'Машинка', component: Car },
		{ id: 'cat', name: 'Кот Коржик', component: Cat },
		{ id: 'robot', name: 'Робот', component: Robot },
		{ id: 'rocket', name: 'Ракета', component: Rocket },
		{ id: 'dino', name: 'Динозаврик', component: Dino }
	];

	const commands: Record<CommandType, { icon: string; label: string }> = {
		move_forward: { icon: '⬆️', label: 'Вперёд' },
		move_backward: { icon: '⬇️', label: 'Назад' },
		turn_left: { icon: '↶', label: 'Влево' },
		turn_right: { icon: '↷', label: 'Вправо' }
	};
	const commandList: { type: CommandType; icon: string; label: string }[] = [
		{ type: 'move_forward', ...commands.move_forward },
		{ type: 'move_backward', ...commands.move_backward },
		{ type: 'turn_left', ...commands.turn_left },
		{ type: 'turn_right', ...commands.turn_right }
	];

	let workspace: Blockly.WorkspaceSvg | null = null;
	let blocklyDiv: HTMLDivElement;
	let robotPosition = $state({ x: 0, y: 4, direction: 'right' });
	let interpreter: Interpreter | null = null;
	let batteries = $state<{ x: number; y: number }[]>([]);
	let score = $state(0);
	let isMobileLayout = $state(false);
	let gridSize = $state(DESKTOP_GRID_SIZE);
	let program = $state<ProgramCommand[]>([]);
	let activeCommandId = $state<string | null>(null);
	let isMenuOpen = $state(false);
	let selectedAvatarId = $state('car');
	let hasLoadedAvatar = $state(false);

	const currentAvatar = $derived(
		avatars.find((avatar) => avatar.id === selectedAvatarId) ?? avatars[0]
	);

	$effect(() => {
		if (hasLoadedAvatar) localStorage.setItem('kids-coder-avatar', selectedAvatarId);
	});

	function updateRobotPosition(position: { x: number; y: number; direction: string }) {
		robotPosition = { ...position };
		const batteryIndex = batteries.findIndex(
			(battery) => battery.x === position.x && battery.y === position.y
		);
		if (batteryIndex !== -1) {
			batteries = batteries.filter((_, index) => index !== batteryIndex);
			score += 1;
		}
	}

	function createInterpreter() {
		if (!workspace) return;
		interpreter = new Interpreter(
			workspace,
			updateRobotPosition,
			gridSize,
			(blockId) => (activeCommandId = blockId)
		);
	}

	function addCommand(type: CommandType) {
		if (!workspace) return;

		const block = workspace.newBlock(type);
		block.initSvg();
		block.render();

		const previousCommand = program.at(-1);
		const previousBlock = previousCommand ? workspace.getBlockById(previousCommand.id) : null;
		if (previousBlock?.nextConnection && block.previousConnection) {
			previousBlock.nextConnection.connect(block.previousConnection);
		}

		program = [...program, { id: block.id, type }];
	}

	function clearProgram() {
		workspace?.clear();
		program = [];
		activeCommandId = null;
	}

	function addBattery() {
		const freeCells: { x: number; y: number }[] = [];
		for (let x = 0; x < gridSize; x++) {
			for (let y = 0; y < gridSize; y++) {
				if (x === robotPosition.x && y === robotPosition.y) continue;
				if (batteries.some((battery) => battery.x === x && battery.y === y)) continue;
				freeCells.push({ x, y });
			}
		}

		if (freeCells.length === 0) {
			alert('На поле нет свободных клеток!');
			return;
		}

		batteries = [...batteries, freeCells[Math.floor(Math.random() * freeCells.length)]];
		isMenuOpen = false;
	}

	function clearField() {
		batteries = [];
		score = 0;
		interpreter?.reset();
		isMenuOpen = false;
	}

	async function runProgram() {
		if (!program.length || !interpreter) return;
		await interpreter.execute();
	}

	function handleViewportChange(event: MediaQueryListEvent) {
		if (event.matches === isMobileLayout) return;

		isMobileLayout = event.matches;
		gridSize = isMobileLayout ? MOBILE_GRID_SIZE : DESKTOP_GRID_SIZE;
		robotPosition = {
			...robotPosition,
			x: Math.min(robotPosition.x, gridSize - 1),
			y: Math.min(robotPosition.y, gridSize - 1)
		};
		batteries = batteries.filter((battery) => battery.x < gridSize && battery.y < gridSize);
		createInterpreter();
	}

	function closeMenu() {
		isMenuOpen = false;
	}

	let mobileMediaQuery: MediaQueryList;

	onMount(() => {
		const savedAvatar = localStorage.getItem('kids-coder-avatar');
		if (avatars.some((avatar) => avatar.id === savedAvatar)) {
			selectedAvatarId = savedAvatar ?? 'car';
		}
		hasLoadedAvatar = true;

		defineCustomBlocks();
		mobileMediaQuery = window.matchMedia('(max-width: 900px) and (pointer: coarse)');
		isMobileLayout = mobileMediaQuery.matches;
		gridSize = isMobileLayout ? MOBILE_GRID_SIZE : DESKTOP_GRID_SIZE;
		robotPosition = { x: 0, y: Math.floor(gridSize / 2), direction: 'right' };

		workspace = Blockly.inject(blocklyDiv, {
			sounds: false,
			trashcan: false,
			move: { scrollbars: false, drag: false, wheel: false }
		});
		createInterpreter();

		mobileMediaQuery.addEventListener('change', handleViewportChange);
	});

	onDestroy(() => {
		mobileMediaQuery?.removeEventListener('change', handleViewportChange);
		workspace?.dispose();
	});
</script>

<div class="game-layout">
	<header class="game-header">
		<a href="/" class="home-link">
			<span class="home-full">← На главную</span>
			<span class="home-short">←</span>
		</a>
		<h1>
			<span class="full-title">🖥️ Программное приключение</span>
			<span class="short-title">Приключение</span>
		</h1>
		<div class="header-actions" role="group" aria-label="Управление игрой">
			{#if !isMobileLayout}
				<select bind:value={selectedAvatarId} aria-label="Выбери героя">
					{#each avatars as avatar}
						<option value={avatar.id}>{avatar.name}</option>
					{/each}
				</select>
			{/if}
			<button class="run-button" onclick={runProgram} type="button">▶ Запустить</button>
			<button class="reset-button" onclick={clearField} type="button">↺ Сброс</button>
		</div>
	</header>

	<main class="game-content">
		<section class="scene-section" aria-label="Игровая сцена">
			<Screen
				position={robotPosition}
				{batteries}
				avatarComponent={currentAvatar.component}
				{gridSize}
			/>
		</section>

		<section class="program-section" aria-labelledby="program-title">
			<div class="program-heading">
				<h2 id="program-title">Программа</h2>
				<button
					class="menu-button"
					class:menu-open={isMenuOpen}
					onclick={() => (isMenuOpen = !isMenuOpen)}
					aria-label="Дополнительные действия"
					aria-expanded={isMenuOpen}
					aria-controls="game-menu"
					type="button"
				>
					⚙️
				</button>
			</div>

			<div class="program-list" aria-live="polite" aria-label="Добавленные команды">
				{#if program.length === 0}
					<p class="program-empty">Нажимай на кнопки внизу, чтобы добавить команды</p>
				{:else}
					{#each program as command, index (command.id)}
						{@const commandInfo = commands[command.type]}
						<div
							class="command-chip"
							class:active={activeCommandId === command.id}
							aria-current={activeCommandId === command.id ? 'step' : undefined}
						>
							<span class="command-number">{index + 1}</span>
							<span class="command-icon" aria-hidden="true">{commandInfo.icon}</span>
							<span>{commandInfo.label}</span>
						</div>
					{/each}
				{/if}
			</div>
		</section>
	</main>

	<footer class="command-palette" role="group" aria-label="Добавить команду">
		{#each commandList as command (command.type)}
			<button
				class="command-button"
				onclick={() => addCommand(command.type)}
				aria-label={`Добавить команду: ${command.label}`}
				type="button"
			>
				<span class="palette-icon" aria-hidden="true">{command.icon}</span>
				<span>{command.label}</span>
			</button>
		{/each}
	</footer>

	<div class="blockly-host" bind:this={blocklyDiv} aria-hidden="true"></div>

	<button
		class="sheet-backdrop"
		class:visible={isMenuOpen}
		onclick={closeMenu}
		aria-label="Закрыть меню"
		aria-hidden={!isMenuOpen}
		tabindex={isMenuOpen ? 0 : -1}
		type="button"
	></button>
	<div
		id="game-menu"
		class="bottom-sheet"
		class:open={isMenuOpen}
		role="dialog"
		tabindex="-1"
		aria-modal={isMenuOpen}
		aria-hidden={!isMenuOpen}
		aria-labelledby="menu-title"
		inert={!isMenuOpen}
	>
		<div class="sheet-handle" aria-hidden="true"></div>
		<div class="sheet-heading">
			<h2 id="menu-title">Дополнительные действия</h2>
			<button class="close-menu" onclick={closeMenu} aria-label="Закрыть меню" type="button">
				✕
			</button>
		</div>
		<button class="sheet-action" onclick={addBattery} type="button">⭐ Добавить звезду</button>
		<p class="sheet-score">⭐ Счёт: {score}</p>
		<button class="sheet-action" onclick={clearField} type="button">🗑️ Очистить поле</button>
		<button class="sheet-action secondary-action" onclick={clearProgram} type="button">
			Очистить программу
		</button>
	</div>
</div>

<style>
	.game-layout {
		display: flex;
		width: 100%;
		height: 100vh;
		height: 100dvh;
		min-height: 0;
		flex-direction: column;
		overflow: hidden;
		background: #f8fafc;
		color: #0f172a;
		font-family: system-ui, sans-serif;
	}

	.game-header {
		display: grid;
		min-height: 60px;
		flex: 0 0 60px;
		grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
		align-items: center;
		gap: 12px;
		padding: 0 16px;
		border-bottom: 1px solid #e2e8f0;
		background: #fff;
	}

	.home-link {
		display: inline-flex;
		width: fit-content;
		min-height: 44px;
		align-items: center;
		color: #334155;
		font-size: 14px;
		font-weight: 600;
		text-decoration: none;
		white-space: nowrap;
	}

	.home-short {
		display: none;
	}

	.game-header h1 {
		margin: 0;
		font-size: clamp(16px, 2vw, 22px);
		text-align: center;
		white-space: nowrap;
	}

	.short-title {
		display: none;
	}

	.header-actions {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 8px;
	}

	.header-actions select,
	.header-actions button {
		min-height: 44px;
		padding: 0 12px;
		border: 0;
		border-radius: 10px;
		font: inherit;
		font-size: 14px;
		white-space: nowrap;
	}

	.header-actions select {
		max-width: 145px;
		border: 1px solid #e2e8f0;
		background: #fff;
	}

	.header-actions button,
	.menu-button,
	.command-button,
	.sheet-action,
	.close-menu,
	.sheet-backdrop {
		cursor: pointer;
	}

	.run-button {
		background: #3b82f6;
		color: #fff;
	}

	.reset-button {
		background: #f3f4f6;
		color: #1f2937;
	}

	.game-content {
		display: grid;
		min-height: 0;
		flex: 1;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		grid-template-rows: minmax(0, 1fr);
		gap: 12px;
		padding: 12px;
	}

	.scene-section {
		display: grid;
		min-width: 0;
		min-height: 0;
		place-items: center;
		overflow: hidden;
	}

	.program-section {
		display: flex;
		min-width: 0;
		min-height: 0;
		flex-direction: column;
		gap: 8px;
		padding: 12px;
		border: 1px solid #e2e8f0;
		border-radius: 16px;
		background: #fff;
	}

	.program-heading,
	.sheet-heading {
		display: flex;
		min-height: 44px;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
	}

	.program-heading h2,
	.sheet-heading h2 {
		margin: 0;
		font-size: 16px;
	}

	.menu-button,
	.close-menu {
		display: grid;
		width: 44px;
		height: 44px;
		flex: 0 0 44px;
		place-items: center;
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		background: #f8fafc;
		font-size: 20px;
		transition:
			background 0.2s ease-out,
			transform 0.2s ease-out;
	}

	.program-list {
		display: flex;
		max-height: 120px;
		min-height: 0;
		flex-wrap: wrap;
		align-content: flex-start;
		gap: 8px;
		overflow-x: hidden;
		overflow-y: auto;
		padding: 2px;
	}

	.program-empty {
		margin: 0;
		color: #64748b;
		font-size: 14px;
		line-height: 1.4;
	}

	.command-chip {
		display: inline-flex;
		min-height: 40px;
		align-items: center;
		gap: 6px;
		padding: 6px 10px;
		border: 1px solid #cbd5e1;
		border-radius: 10px;
		background: #f8fafc;
		font-size: 14px;
		transition:
			background 0.2s ease-out,
			border-color 0.2s ease-out;
	}

	.command-chip.active {
		border-color: #3b82f6;
		background: #dbeafe;
	}

	.command-number {
		color: #64748b;
		font-size: 12px;
		font-weight: 700;
	}

	.command-icon {
		font-size: 16px;
	}

	.command-palette {
		display: grid;
		min-height: 104px;
		flex: 0 0 auto;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 8px;
		padding: 12px;
		background: #f8fafc;
		border-top: 1px solid #e2e8f0;
	}

	.command-button {
		display: flex;
		min-width: 0;
		min-height: 80px;
		flex: 1;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 6px;
		padding: 8px;
		border: 0;
		border-radius: 12px;
		background: #3b82f6;
		box-shadow: 0 4px 6px rgb(59 130 246 / 30%);
		color: #fff;
		font: inherit;
		font-size: 14px;
		font-weight: 600;
		touch-action: manipulation;
		transition:
			transform 0.2s ease-out,
			background 0.2s ease-out;
	}

	.palette-icon {
		font-size: 22px;
		line-height: 1;
	}

	.blockly-host {
		position: fixed;
		top: 0;
		left: -10000px;
		width: 320px;
		height: 240px;
		overflow: hidden;
		visibility: hidden;
		pointer-events: none;
	}

	.sheet-backdrop {
		position: fixed;
		z-index: 99;
		inset: 0;
		border: 0;
		background: rgb(15 23 42 / 45%);
		opacity: 0;
		pointer-events: none;
		transition: opacity 0.3s ease-out;
	}

	.sheet-backdrop.visible {
		opacity: 1;
		pointer-events: auto;
	}

	.bottom-sheet {
		position: fixed;
		z-index: 100;
		right: 0;
		bottom: 0;
		left: 0;
		display: flex;
		max-height: min(80vh, 520px);
		flex-direction: column;
		gap: 10px;
		padding: 10px 20px calc(20px + env(safe-area-inset-bottom));
		transform: translateY(100%);
		border-radius: 20px 20px 0 0;
		background: #fff;
		box-shadow: 0 -8px 30px rgb(15 23 42 / 15%);
		transition: transform 0.3s ease-out;
	}

	.bottom-sheet.open {
		transform: translateY(0);
	}

	.sheet-handle {
		width: 40px;
		height: 4px;
		align-self: center;
		border-radius: 99px;
		background: #cbd5e1;
	}

	.close-menu {
		font-size: 18px;
	}

	.sheet-action {
		min-height: 48px;
		padding: 10px 14px;
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		background: #f8fafc;
		color: #0f172a;
		font: inherit;
		font-size: 15px;
		text-align: left;
	}

	.sheet-score {
		margin: 0;
		padding: 10px 14px;
		border-radius: 12px;
		background: #fef3c7;
		color: #854d0e;
		font-size: 15px;
		font-weight: 700;
	}

	.secondary-action {
		color: #475569;
	}

	@media (max-width: 900px) and (pointer: coarse) {
		.game-layout {
			height: 100vh;
			height: 100dvh;
			min-height: 0;
			overflow: hidden;
		}

		.game-header {
			min-height: 52px;
			flex-basis: 52px;
			grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
			gap: 6px;
			padding: 0 8px;
		}

		.home-link {
			font-size: 13px;
		}

		.game-header h1 {
			font-size: 16px;
		}

		.full-title,
		.header-actions select {
			display: none;
		}

		.short-title {
			display: inline;
		}

		.header-actions {
			gap: 5px;
		}

		.header-actions button {
			min-height: 44px;
			padding: 0 8px;
			font-size: 13px;
		}

		.game-content {
			display: flex;
			flex-direction: column;
			overflow: hidden;
			gap: 4px;
			padding: 4px 8px;
		}

		.scene-section {
			flex: 1 1 0;
			min-height: 0;
			padding: 4px;
		}

		.program-section {
			height: 120px;
			flex: 0 0 120px;
			overflow: hidden;
			gap: 4px;
			padding: 4px 8px;
			border: 0;
			border-radius: 10px;
			background: transparent;
		}

		.program-heading {
			min-height: 40px;
			flex: 0 0 40px;
		}

		.program-heading h2 {
			font-size: 14px;
		}

		.menu-button {
			width: 40px;
			height: 40px;
			flex-basis: 40px;
		}

		.program-list {
			max-height: none;
			min-height: 0;
			flex: 1 1 auto;
			gap: 4px;
		}

		.command-chip {
			min-height: 30px;
			gap: 4px;
			padding: 3px 7px;
			font-size: 13px;
		}

		.command-palette {
			height: 100px;
			min-height: 100px;
			flex: 0 0 100px;
			padding: 8px 4px 4px;
		}

		.command-button {
			min-height: 20px;
			font-size: 14px;
			flex-direction: row;
			padding: 5px;
		}

		.bottom-sheet {
			padding-right: 16px;
			padding-left: 16px;
		}
	}

	@media (max-width: 499px) and (pointer: coarse) {
		.game-header {
			grid-template-columns: auto minmax(0, 1fr) auto;
		}

		.game-header h1 {
			font-size: 14px;
		}

		.home-full {
			display: none;
		}

		.home-short {
			display: inline;
		}

		.command-palette {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			padding: 8px;
		}
	}

	@media (max-height: 600px) and (pointer: coarse) {
		.program-section {
			height: 80px;
			flex-basis: 80px;
		}

		.program-heading {
			min-height: 28px;
			flex-basis: 28px;
		}

		.menu-button {
			width: 28px;
			height: 28px;
			flex-basis: 28px;
		}

		.command-palette {
			height: 30px;
			min-height: 28px;
			flex-basis: 45px;
			padding: 6px 8px;
		}

		.command-button {
			min-height: 0;
		}
	}

	@media (min-width: 768px) and (max-width: 900px) and (pointer: coarse) {
		.scene-section {
			padding: 8px;
		}

		.program-section {
			padding: 10px 16px;
		}
	}

	@media (hover: hover) {
		.header-actions button:hover,
		.menu-button:hover,
		.close-menu:hover,
		.sheet-action:hover {
			filter: brightness(0.96);
		}

		.command-button:hover {
			background: #2563eb;
		}
	}

	.command-button:active {
		transform: scale(0.95);
	}

	@media (prefers-reduced-motion: reduce) {
		* {
			scroll-behavior: auto !important;
			transition-duration: 0.01ms !important;
		}
	}
</style>
