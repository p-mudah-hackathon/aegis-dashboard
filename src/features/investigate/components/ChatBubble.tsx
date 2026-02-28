import React, { useState } from 'react';
import { Bot, User, ChevronDown, ChevronUp, Brain } from 'lucide-react';
import type { LocalMessage } from '../types';

interface ChatBubbleProps {
	message: LocalMessage;
}

function renderMarkdown(text: string): React.ReactNode[] {
	const lines = text.split('\n');
	const elements: React.ReactNode[] = [];

	let inCodeBlock = false;
	let codeContent = '';
	let codeKey = 0;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];

		if (line.trim().startsWith('```')) {
			if (inCodeBlock) {
				elements.push(
					<pre
						key={`code-${codeKey++}`}
						className='my-2 p-3 bg-surface- terminal rounded-lg text-[12px] font-mono text-text-secondary border border-border-subtle overflow-x-auto whitespace-pre-wrap'
					>
						{codeContent.trimEnd()}
					</pre>,
				);
				codeContent = '';
				inCodeBlock = false;
			} else {
				inCodeBlock = true;
			}
			continue;
		}

		if (inCodeBlock) {
			codeContent += (codeContent ? '\n' : '') + line;
			continue;
		}

		if (line.startsWith('### ')) {
			elements.push(
				<p key={i} className='font-bold text-text-primary text-sm mt-3 mb-1'>
					{inlineFormat(line.slice(4))}
				</p>,
			);
			continue;
		}
		if (line.startsWith('## ')) {
			elements.push(
				<p
					key={i}
					className='font-bold text-text-primary text-[15px] mt-3 mb-1'
				>
					{inlineFormat(line.slice(3))}
				</p>,
			);
			continue;
		}
		if (line.startsWith('# ')) {
			elements.push(
				<p key={i} className='font-bold text-text-primary text-base mt-3 mb-1'>
					{inlineFormat(line.slice(2))}
				</p>,
			);
			continue;
		}

		if (/^\s*[-*•]\s/.test(line)) {
			const content = line.replace(/^\s*[-*•]\s/, '');
			elements.push(
				<div key={i} className='flex gap-2 ml-2 my-0.5'>
					<span className='text-primary shrink-0 mt-0.5'>•</span>
					<span className='text-text-secondary'>{inlineFormat(content)}</span>
				</div>,
			);
			continue;
		}

		if (/^\s*\d+[.)]\s/.test(line)) {
			const match = line.match(/^\s*(\d+)[.)]\s(.*)/);
			if (match) {
				elements.push(
					<div key={i} className='flex gap-2 ml-2 my-0.5'>
						<span className='text-primary shrink-0 font-bold text-[11px] mt-0.5 min-w-[1.2em] text-right'>
							{match[1]}.
						</span>
						<span className='text-text-secondary'>
							{inlineFormat(match[2])}
						</span>
					</div>,
				);
				continue;
			}
		}

		if (line.trim() === '---' || line.trim() === '***') {
			elements.push(<hr key={i} className='border-border-subtle my-2' />);
			continue;
		}

		if (line.trim() === '') {
			elements.push(<div key={i} className='h-1.5' />);
			continue;
		}

		elements.push(
			<p key={i} className='my-0.5'>
				{inlineFormat(line)}
			</p>,
		);
	}

	if (inCodeBlock && codeContent) {
		elements.push(
			<pre
				key={`code-final`}
				className='my-2 p-3 bg-surface-terminal rounded-lg text-[12px] font-mono text-text-secondary border border-border-subtle overflow-x-auto whitespace-pre-wrap'
			>
				{codeContent.trimEnd()}
			</pre>,
		);
	}

	return elements;
}

function inlineFormat(text: string): React.ReactNode[] {
	const parts: React.ReactNode[] = [];
	const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|~~(.+?)~~)/g;
	let lastIndex = 0;
	let match;
	let key = 0;

	while ((match = regex.exec(text)) !== null) {
		if (match.index > lastIndex) {
			parts.push(text.slice(lastIndex, match.index));
		}

		if (match[2]) {
			parts.push(
				<strong key={key++} className='font-bold text-text-primary'>
					{match[2]}
				</strong>,
			);
		} else if (match[3]) {
			parts.push(
				<em key={key++} className='italic text-text-secondary'>
					{match[3]}
				</em>,
			);
		} else if (match[4]) {
			parts.push(
				<code
					key={key++}
					className='px-1.5 py-0.5 bg-surface-2 rounded text-primary text-[12px] font-mono'
				>
					{match[4]}
				</code>,
			);
		} else if (match[5]) {
			parts.push(
				<del key={key++} className='text-text-muted'>
					{match[5]}
				</del>,
			);
		}

		lastIndex = match.index + match[0].length;
	}

	if (lastIndex < text.length) {
		parts.push(text.slice(lastIndex));
	}

	return parts.length > 0 ? parts : [text];
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
	const isBot = message.role === 'bot';
	const [showReasoning, setShowReasoning] = useState(false);

	return (
		<div className={`flex gap-3 ${isBot ? '' : 'flex-row-reverse'}`}>
			<div
				className={`shrink-0 size-8 rounded-xl flex items-center justify-center transition-colors ${
					isBot
						? 'bg-primary/10 border border-primary/30'
						: 'bg-info/10 border border-info/30'
				}`}
			>
				{isBot ? (
					<Bot size={16} className='text-primary' />
				) : (
					<User size={16} className='text-info' />
				)}
			</div>

			<div className={`max-w-[80%] ${isBot ? '' : 'text-right'}`}>
				<div
					className={`inline-block px-4 py-3 rounded-2xl text-sm leading-relaxed transition-all duration-300 ${
						isBot
							? 'bg-surface-2 text-text-secondary rounded-tl-md border border-border-subtle'
							: 'bg-primary/10 text-text-primary rounded-tr-md border border-primary/20'
					}`}
				>
					{message.image && (
						<div className='mb-2'>
							<img
								src={message.image}
								alt='Attachment'
								className='max-w-full max-h-48 rounded-lg border border-border-subtle'
							/>
						</div>
					)}

					{isBot && message.reasoning && (
						<button
							onClick={() => setShowReasoning(!showReasoning)}
							className='flex items-center gap-1.5 mb-2 text-[10px] text-purple hover:opacity-80 transition-opacity'
						>
							<Brain size={12} />
							{showReasoning ? 'Hide' : 'Show'} AI Reasoning
							{showReasoning ? (
								<ChevronUp size={10} />
							) : (
								<ChevronDown size={10} />
							)}
						</button>
					)}

					{showReasoning && message.reasoning && (
						<div className='mb-3 p-3 bg-purple-500/5 rounded-lg border border-purple-500/10 text-[11px] text-purple-300/80 leading-relaxed'>
							<div>{renderMarkdown(message.reasoning)}</div>
						</div>
					)}

					{isBot ? (
						<div className='space-y-0'>{renderMarkdown(message.content)}</div>
					) : (
						<p className='whitespace-pre-wrap'>{message.content}</p>
					)}
				</div>
				<p className='text-[10px] text-text-muted mt-1 px-1'>
					{message.timestamp.toLocaleTimeString('id-ID', {
						hour: '2-digit',
						minute: '2-digit',
					})}
				</p>
			</div>
		</div>
	);
};
