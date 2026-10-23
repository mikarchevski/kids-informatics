export interface Game {
	id: string;
	slug: string; // URL-friendly имя, например 'schulte-table'
	title: string;
	description: string;
	ageRange: {
		min: number;
		max: number;
	};
	category: 'logic' | 'math' | 'reading' | 'attention' | 'spatial';
	icon: string; // Emoji или путь к иконке
	difficulty: 'easy' | 'medium' | 'hard';
	estimatedTime: string; // Например, "5-10 минут"
	isAvailable: boolean; // Готов ли игра к запуску
}
