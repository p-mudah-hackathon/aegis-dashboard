export interface ChatMessage {
	id: string;
	role: 'user' | 'bot';
	content: string;
	image?: string;
	timestamp: Date;
}
