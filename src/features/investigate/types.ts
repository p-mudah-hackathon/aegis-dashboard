import type { ChatSession, Transaction } from '../../api';

export interface LocalMessage {
	id: string;
	role: 'user' | 'bot';
	content: string;
	reasoning?: string | null;
	image?: string;
	timestamp: Date;
}

export type { ChatSession, Transaction };
