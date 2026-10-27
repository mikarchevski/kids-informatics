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
		slug: 'sorting',
		title: 'Сортировка: Фрукты и овощи',
		description: 'Помоги разложить продукты по корзинкам. Развиваем логику и классификацию.',
		ageRange: { min: 3, max: 6 },
		category: 'logic',
		icon: '🍎',
		difficulty: 'easy',
		estimatedTime: '5-7 минут',
		isAvailable: true // Ещё не реализовано
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
		slug: 'memory',
		title: 'Мемори — Найди пару',
		description: 'Переворачивай карточки и ищи одинаковые пары. Развивает память и концентрацию.',
		ageRange: { min: 4, max: 10 },
		category: 'memory',
		icon: '🃏',
		difficulty: 'easy',
		estimatedTime: '5-10 минут',
		isAvailable: true
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
	},
	{
		id: '6',
		slug: 'logic-chains',
		title: 'Логические цепочки',
		description:
			'Найди закономерность и выбери, что будет дальше. Развиваем логику и наблюдательность.',
		ageRange: { min: 4, max: 8 },
		category: 'logic',
		icon: '🧩',
		difficulty: 'easy',
		estimatedTime: '5-10 минут',
		isAvailable: true
	},
	{
		id: '7',
		slug: 'odd-one-out',
		title: 'Найди лишнее',
		description:
			'Сравни предметы и найди тот, который не подходит к остальным. Тренируем внимание и мышление.',
		ageRange: { min: 4, max: 8 },
		category: 'logic',
		icon: '🔍',
		difficulty: 'easy',
		estimatedTime: '5-10 минут',
		isAvailable: true
	},
	{
		id: '8',
		slug: 'math',
		title: 'Весёлый счёт',
		description: 'Учимся считать предметы, складывать и вычитать в игровой форме.',
		ageRange: { min: 4, max: 7 },
		category: 'math',
		icon: '🔢',
		difficulty: 'easy',
		estimatedTime: '5-10 минут',
		isAvailable: true
	},
	{
		id: '9',
		slug: 'maze',
		title: 'Лабиринт',
		description: 'Проведи героя через лабиринт к финишу, обходя стены и планируя маршрут.',
		ageRange: { min: 4, max: 8 },
		category: 'spatial',
		icon: '🧭',
		difficulty: 'easy',
		estimatedTime: '2-5 минут',
		isAvailable: true
	},
	{
		id: '10',
		slug: 'rotate-shape',
		title: 'Поверни фигуру',
		description:
			'Развивай пространственное мышление: учись мысленно вращать фигуры и находить правильные отражения.',
		ageRange: { min: 14, max: 100 },
		category: 'spatial',
		icon: '🔄',
		difficulty: 'hard',
		estimatedTime: '5-10 минут',
		isAvailable: true
	},
	{
		id: '11',
		slug: 'similar-shape',
		title: 'Найди похожую фигуру',
		description:
			'Учись находить похожие геометрические фигуры по количеству сторон. Развивает геометрическое мышление.',
		ageRange: { min: 5, max: 10 },
		category: 'spatial',
		icon: '🔷',
		difficulty: 'easy',
		estimatedTime: '5-10 минут',
		isAvailable: true
	},
	{
		id: '12',
		slug: 'compare-numbers',
		title: 'Больше или меньше',
		description:
			'Сравнивай числа и выбирай правильный знак: <, = или >. За правильный ответ — 10 очков, за ошибку −2 секунды. У тебя 60 секунд!',
		ageRange: { min: 6, max: 12 },
		category: 'math',
		icon: '️',
		difficulty: 'easy',
		estimatedTime: '1-2 минуты',
		isAvailable: true
	}
];
