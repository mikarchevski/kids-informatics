export function getWordCount(text: string): number {
	return text.match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu)?.length ?? 0;
}

export function getReadTime(text: string): string {
	return `${Math.max(1, Math.ceil(getWordCount(text) / 200))} мин`;
}

export function getTextFromHtml(html: string): string {
	return html.replace(/<[^>]*>/g, ' ').replace(/&(?:nbsp|#160);/gi, ' ');
}

export function getReadTimeFromHtml(html: string): string {
	return getReadTime(getTextFromHtml(html));
}
