export interface ChatMessage {
	id: string;
	role: 'user' | 'bot';
	content: string;
	reasoning?: string | null;
	image?: string;
	timestamp: Date;
}
