export type DictationDirection = 'up' | 'down' | 'left' | 'right';
export type DictationEdge = 'bottom' | 'left' | 'right';

export interface DictationPathStep {
	x: number;
	y: number;
	direction: DictationDirection;
}

function edgeForMovement(direction: DictationDirection): DictationEdge {
	switch (direction) {
		case 'right':
			return 'bottom';
		case 'left':
			return 'bottom';
		case 'up':
			return 'right';
		case 'down':
			return 'left';
	}
}

function normalizeSharedEdges(edges: Set<string>): Set<string> {
	const normalizedEdges = new Set<string>();
	const seenSegments = new Set<string>();

	for (const edgeKey of edges) {
		const [xValue, yValue, edge] = edgeKey.split(',');
		const x = Number(xValue);
		const y = Number(yValue);
		let segmentKey = '';
		let normalizedKey = edgeKey;

		if (edge === 'left' || edge === 'right') {
			const boundaryX = edge === 'left' ? x : x + 1;
			segmentKey = `v,${boundaryX},${y}`;
			normalizedKey =
				boundaryX > 0 ? `${boundaryX - 1},${y},right` : `${boundaryX},${y},left`;
		} else if (edge === 'bottom') {
			segmentKey = `h,${x},${y + 1}`;
			normalizedKey = `${x},${y},bottom`;
		}

		if (!seenSegments.has(segmentKey)) {
			seenSegments.add(segmentKey);
			normalizedEdges.add(normalizedKey);
		}
	}

	return normalizedEdges;
}

/** Build edges for each movement and join incoming and outgoing edges at turns. */
export function buildDictationEdges(path: DictationPathStep[]): Set<string> {
	const edges = new Set<string>();
	let downRunUsesRightEdge = false;
	let previousMovementEdge: DictationEdge | null = null;

	path.forEach((step, index) => {
		const previousStep = path[index - 1];
		let previousX = previousStep?.x ?? -1;
		let previousY = previousStep?.y ?? -1;
		if (previousStep?.direction === 'right') previousX++;
		else if (previousStep?.direction === 'left') previousX--;
		else if (previousStep?.direction === 'down') previousY++;
		else if (previousStep?.direction === 'up') previousY--;

		const isConnectedPreviousStep =
			previousStep !== undefined &&
			previousX === step.x &&
			previousY === step.y;
		const isConnectedTurn =
			isConnectedPreviousStep && previousStep?.direction !== step.direction;
		const isRightTurn = isConnectedTurn && step.direction === 'right';
		const isUpToRightTurn = isRightTurn && previousStep?.direction === 'up';
		if (step.direction === 'down') {
			if (isConnectedTurn) {
				downRunUsesRightEdge = true;
			} else if (!isConnectedPreviousStep) {
				downRunUsesRightEdge = false;
			}
		} else {
			downRunUsesRightEdge = false;
		}

		const isMovingDown = step.direction === 'down';
		const edge = isMovingDown && downRunUsesRightEdge ? 'right' : edgeForMovement(step.direction);
		const edgeX = isRightTurn ? step.x + 1 : step.x;
		const edgeY = isMovingDown ? step.y + 1 : step.y;
		edges.add(`${edgeX},${edgeY},${edge}`);

		// At a turn, join the incoming segment to the outgoing one in the corner cell.
		if (
			isConnectedTurn &&
			previousStep &&
			!(step.direction === 'down' && previousStep.direction !== 'right') &&
			!(step.direction === 'left' && previousMovementEdge === 'right') &&
			!(previousStep.direction === 'left' && step.direction === 'up') &&
			!isUpToRightTurn
		) {
			if (previousMovementEdge) {
				edges.add(`${step.x},${step.y},${previousMovementEdge}`);
			}
		}
		previousMovementEdge = edge;
	});

	return normalizeSharedEdges(edges);
}
