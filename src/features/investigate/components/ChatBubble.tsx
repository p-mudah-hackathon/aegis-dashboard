import React from 'react';
import { Bot, User } from 'lucide-react';
import type { ChatMessage } from '../types';

interface ChatBubbleProps {
	message: ChatMessage;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
	const isBot = message.role === 'bot';

	return (
		<div className={`flex gap-3 ${isBot ? '' : 'flex-row-reverse'}`}>
			{/* Avatar */}
			<div
				className={`shrink-0 size-8 rounded-xl flex items-center justify-center ${
					isBot
						? 'bg-orange-500/10 border border-orange-500/30'
						: 'bg-blue-500/10 border border-blue-500/30'
				}`}
			>
				{isBot ? (
					<Bot size={16} className='text-orange-400' />
				) : (
					<User size={16} className='text-blue-400' />
				)}
			</div>

			{/* Bubble */}
			<div className={`max-w-[75%] ${isBot ? '' : 'text-right'}`}>
				<div
					className={`inline-block px-4 py-3 rounded-2xl text-sm leading-relaxed ${
						isBot
							? 'bg-[#1e1e1e] text-gray-200 rounded-tl-md border border-white/5'
							: 'bg-orange-500/15 text-gray-100 rounded-tr-md border border-orange-500/20'
					}`}
				>
					{/* Image attachment */}
					{message.image && (
						<div className='mb-2'>
							<img
								src={message.image}
								alt='Attachment'
								className='max-w-full max-h-48 rounded-lg border border-white/10'
							/>
						</div>
					)}
					<p className='whitespace-pre-wrap'>{message.content}</p>
				</div>
				<p className='text-[10px] text-gray-600 mt-1 px-1'>
					{message.timestamp.toLocaleTimeString('id-ID', {
						hour: '2-digit',
						minute: '2-digit',
					})}
				</p>
			</div>
		</div>
	);
};
