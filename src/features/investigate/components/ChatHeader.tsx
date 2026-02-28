import React from 'react';
import { Sparkles } from 'lucide-react';

interface ChatHeaderProps {
	title?: string;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ title }) => {
	return (
		<div className='shrink-0 bg-[#0f0f0f] border-b border-white/5 px-6 py-3'>
			<div className='flex items-center justify-center'>
				{title ? (
					<h1 className='text-gray-300 text-sm font-medium truncate max-w-md'>
						{title}
					</h1>
				) : (
					<div className='flex items-center gap-2'>
						<Sparkles size={16} className='text-orange-400' />
						<h1 className='text-gray-300 text-sm font-medium'>
							AEGIS AI Investigator
						</h1>
					</div>
				)}
			</div>
		</div>
	);
};
