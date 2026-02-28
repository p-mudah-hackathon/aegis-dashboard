import { LucideIcon } from 'lucide-react';

export interface Log {
	id: number;
	type: 'attack' | 'system' | 'blocked' | 'success';
	message: string;
	timestamp: string;
	details?: string;
}

export interface Scenario {
	id: string;
	icon: LucideIcon;
	title: string;
	description: string;
	reason: string;
	color: string;
	borderColor: string;
	glowColor: string;
	accent: string;
	logs: { type: Log['type']; message: string; details?: string }[];
}
