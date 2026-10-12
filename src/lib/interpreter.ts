import type { WorkspaceSvg } from 'blockly';

type Position = { x: number; y: number; direction: string };
type Callback = (pos: Position) => void;

export class Interpreter {
	private workspace: WorkspaceSvg;
	private onUpdate: Callback;
	private position: Position = { x: 0, y: 0, direction: 'right' };
	private isRunning = false;

	constructor(workspace: WorkspaceSvg, onUpdate: Callback) {
		this.workspace = workspace;
		this.onUpdate = onUpdate;
	}

	reset() {
		this.position = { x: 0, y: 5, direction: 'right' };
		this.isRunning = false;
		this.onUpdate({ ...this.position });
	}

	async execute() {
		if (this.isRunning) return;
		this.isRunning = true;

		// Сбрасываем позицию перед выполнением
		this.position = { x: 0, y: 5, direction: 'right' };
		this.onUpdate({ ...this.position });

		const topBlocks = this.workspace.getTopBlocks(true);

		for (const block of topBlocks) {
			await this.executeBlock(block);
		}

		this.isRunning = false;
	}

	private async executeBlock(block: any): Promise<void> {
		if (!block) return;

		const type = block.type;
		const GRID_SIZE = 10;

		// Вспомогательная функция проверки границ
		const isInside = (x: number, y: number) => x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE;

		// Запоминаем позицию ДО движения
		const prevPos = { ...this.position };

		switch (type) {
			case 'move_forward':
				if (this.position.direction === 'right') this.position.x++;
				else if (this.position.direction === 'left') this.position.x--;
				else if (this.position.direction === 'up') this.position.y--;
				else if (this.position.direction === 'down') this.position.y++;
				break;

			case 'move_backward':
				if (this.position.direction === 'right') this.position.x--;
				else if (this.position.direction === 'left') this.position.x++;
				else if (this.position.direction === 'up') this.position.y++;
				else if (this.position.direction === 'down') this.position.y--;
				break;

			case 'move_up':
				this.position.y--;
				break;

			case 'move_down':
				this.position.y++;
				break;

			case 'turn_left':
				if (this.position.direction === 'right') this.position.direction = 'up';
				else if (this.position.direction === 'up') this.position.direction = 'left';
				else if (this.position.direction === 'left') this.position.direction = 'down';
				else if (this.position.direction === 'down') this.position.direction = 'right';
				break;

			case 'turn_right':
				if (this.position.direction === 'right') this.position.direction = 'down';
				else if (this.position.direction === 'down') this.position.direction = 'left';
				else if (this.position.direction === 'left') this.position.direction = 'up';
				else if (this.position.direction === 'up') this.position.direction = 'right';
				break;
		}

		// // Если вышли за границы — откатываем движение
		// if (!isInside(this.position.x, this.position.y)) {
		//     this.position = prevPos;
		//     console.log('🚧 Робот уперся в стену!');
		// }
		this.position.x = ((this.position.x % GRID_SIZE) + GRID_SIZE) % GRID_SIZE;
		this.position.y = ((this.position.y % GRID_SIZE) + GRID_SIZE) % GRID_SIZE;
		this.onUpdate({ ...this.position });
		await this.delay(300);

		if (block.nextConnection?.targetBlock()) {
			await this.executeBlock(block.nextConnection.targetBlock());
		}
	}

	private delay(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
}
