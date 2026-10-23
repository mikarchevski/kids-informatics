import type { Game } from '#lib/types/games';

export const games: Game[] = [
	{
		id: '1',
		slug: 'schulte-table',
		title: 'Таблица Шульте',
		description: 'Тренажёр внимания и скорочтения. Найди все числа по порядку как можно быстрее!',
		ageRange: { min: 7, max: 14 },
		category: 'attention',
		icon: '🔢',
		difficulty: 'easy',
		estimatedTime: '3-5 минут',
		isAvailable: true
	},
	{
		id: '2',
		slug: 'sorting-fruits-vegetables',
		title: 'Сортировка: Фрукты и овощи',
		description: 'Помоги разложить продукты по корзинкам. Развиваем логику и классификацию.',
		ageRange: { min: 3, max: 6 },
		category: 'logic',
		icon: '🍎',
		difficulty: 'easy',
		estimatedTime: '5-7 минут',
		isAvailable: false // Ещё не реализовано
	},
	{
		id: '3',
		slug: 'graphic-dictation',
		title: 'Графический диктант',
		description: 'Рисуй по клеточкам, слушая команды. Развиваем пространственное мышление.',
		ageRange: { min: 5, max: 8 },
		category: 'spatial',
		icon: '✏️',
		difficulty: 'medium',
		estimatedTime: '10-15 минут',
		isAvailable: true
	},
	{
		id: '4',
		slug: 'sudoku-kids',
		title: 'Детское Судоку',
		description: 'Классическая головоломка для детей. Начни с 4×4 и переходи к 6×6!',
		ageRange: { min: 6, max: 10 },
		category: 'logic',
		icon: '🧩',
		difficulty: 'medium',
		estimatedTime: '10-20 минут',
		isAvailable: false
	},
	{
		id: '5',
		slug: 'more-less-equal',
		title: 'Больше, меньше, равно',
		description: 'Сравнивай числа и группы предметов. Фундамент математики для дошкольников.',
		ageRange: { min: 4, max: 7 },
		category: 'math',
		icon: '⚖️',
		difficulty: 'easy',
		estimatedTime: '5-10 минут',
		isAvailable: false
	}
];
