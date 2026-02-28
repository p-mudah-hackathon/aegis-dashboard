import React from 'react';
import { Sparkles } from 'lucide-react';

interface ChatHeaderProps {
	title?: string;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ title }) => {
	return (
		<div className='shrink-0 bg-surface-1 border-b border-border px-6 py-3'>
			<div className='flex items-center justify-center'>
				{title ? (
					<h1 className='text-text-tertiary text-sm font-medium truncate max-w-md'>
						{title}
					</h1>
				) : (
					<div className='flex items-center gap-2'>
						<Sparkles size={16} className='text-primary' />
						<h1 className='text-text-tertiary text-sm font-medium'>
							AEGIS AI Investigator
						</h1>
					</div>
				)}
			</div>
		</div>
	);
};
