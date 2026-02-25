import React, { useState, useRef, useEffect } from 'react';
import { Bot, Sparkles } from 'lucide-react';
import { ChatBubble } from './components/ChatBubble';
import { ChatInput } from './components/ChatInput';
import { getBotResponse } from './botResponses';
import type { ChatMessage } from './types';

const WELCOME_MESSAGE: ChatMessage = {
	id: 'welcome',
	role: 'bot',
	content:
		'Welcome to AEGIS Investigation Assistant 🔍\n\nI can help you analyze suspicious transactions, detect fraud patterns, and assess risk scores.\n\nTry asking:\n• "Show fraud patterns"\n• "Analyze TX-7"\n• "Merchant risk analysis"\n• "Explain risk score model"',
	timestamp: new Date(),
};

export const InvestigatePage: React.FC = () => {
	const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
	const [isTyping, setIsTyping] = useState(false);
	const scrollRef = useRef<HTMLDivElement>(null);

	// Auto-scroll to bottom on new messages
	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [messages, isTyping]);

	const handleSend = async (content: string, image?: string) => {
		// Add user message
		const userMsg: ChatMessage = {
			id: `u-${Date.now()}`,
			role: 'user',
			content,
			image,
			timestamp: new Date(),
		};
		setMessages((prev) => [...prev, userMsg]);
		setIsTyping(true);

		// Get bot response
		const response = await getBotResponse(content);

		const botMsg: ChatMessage = {
			id: `b-${Date.now()}`,
			role: 'bot',
			content: response,
			timestamp: new Date(),
		};
		setMessages((prev) => [...prev, botMsg]);
		setIsTyping(false);
	};

	return (
		<div className='flex-1 flex flex-col h-screen overflow-hidden'>
			{/* Header */}
			<div className='shrink-0 bg-[#0f0f0f] border-b border-white/5 px-8 py-5'>
				<div className='flex items-center gap-3'>
					<div className='size-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center'>
						<Sparkles size={20} className='text-orange-400' />
					</div>
					<div>
						<h1 className='text-white text-lg font-bold'>
							AEGIS Investigation Assistant
						</h1>
						<p className='text-gray-500 text-xs'>
							AI-powered fraud investigation chatbot
						</p>
					</div>
					<div className='ml-auto flex items-center gap-2'>
						<div className='size-2 rounded-full bg-green-500 animate-pulse' />
						<span className='text-[11px] text-gray-500'>Online</span>
					</div>
				</div>
			</div>

			{/* Chat Area */}
			<div
				ref={scrollRef}
				className='flex-1 overflow-y-auto px-8 py-6 space-y-5'
				style={{
					background:
						'radial-gradient(circle at 30% 20%, rgba(249,115,22,0.03) 0%, transparent 50%), #0a0a0a',
				}}
			>
				{messages.map((msg) => (
					<ChatBubble key={msg.id} message={msg} />
				))}

				{/* Typing indicator */}
				{isTyping && (
					<div className='flex gap-3'>
						<div className='shrink-0 size-8 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center'>
							<Bot size={16} className='text-orange-400' />
						</div>
						<div className='bg-[#1e1e1e] border border-white/5 rounded-2xl rounded-tl-md px-4 py-3'>
							<div className='flex gap-1'>
								<span
									className='size-2 rounded-full bg-gray-500 animate-bounce'
									style={{ animationDelay: '0ms' }}
								/>
								<span
									className='size-2 rounded-full bg-gray-500 animate-bounce'
									style={{ animationDelay: '150ms' }}
								/>
								<span
									className='size-2 rounded-full bg-gray-500 animate-bounce'
									style={{ animationDelay: '300ms' }}
								/>
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Input Area */}
			<ChatInput onSend={handleSend} disabled={isTyping} />
		</div>
	);
};
