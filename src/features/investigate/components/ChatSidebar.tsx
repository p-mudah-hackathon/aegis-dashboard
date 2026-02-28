import React from 'react';
import { MessageSquare, Trash2, Menu, SquarePen } from 'lucide-react';
import type { ChatSession } from '../types';

interface ChatSidebarProps {
	chatId: string | null;
	sessions: ChatSession[];
	collapsed: boolean;
	onToggle: () => void;
	onNewChat: () => void;
	onLoadChat: (session: ChatSession) => void;
	onDeleteChat: (e: React.MouseEvent, chatId: string) => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
	chatId,
	sessions,
	collapsed,
	onToggle,
	onNewChat,
	onLoadChat,
	onDeleteChat,
}) => {
	return (
		<aside
			className='bg-surface-1 border-r border-border flex flex-col shrink-0 transition-all duration-300 ease-in-out'
			style={{ width: collapsed ? 56 : 288 }}
		>
			<div className='shrink-0 p-2'>
				<button
					onClick={onToggle}
					className='size-10 rounded-full flex items-center justify-center text-text-muted hover:text-foreground hover:bg-accent transition-colors'
					title={collapsed ? 'Open sidebar' : 'Close sidebar'}
				>
					<Menu size={20} />
				</button>
			</div>

			<div
				className='shrink-0 border-b border-border transition-all duration-300'
				style={{ padding: collapsed ? '0 6px 12px' : '0 8px 12px' }}
			>
				<button
					onClick={onNewChat}
					className='flex items-center justify-center border border-primary/30 text-primary transition-all duration-300 w-full'
					style={{
						height: 40,
						borderRadius: collapsed ? 20 : 12,
						background: 'var(--sem-warning-muted, rgba(249, 115, 22, 0.1))',
						gap: collapsed ? 0 : 10,
					}}
					title='New investigation'
				>
					<SquarePen size={collapsed ? 18 : 16} className='shrink-0' />
					<span
						className='overflow-hidden whitespace-nowrap transition-all duration-300 text-sm font-bold'
						style={{
							maxWidth: collapsed ? 0 : 160,
							opacity: collapsed ? 0 : 1,
						}}
					>
						New Investigation
					</span>
				</button>
			</div>

			<div
				className='flex-1 overflow-hidden transition-opacity duration-300'
				style={{
					opacity: collapsed ? 0 : 1,
					pointerEvents: collapsed ? 'none' : 'auto',
				}}
			>
				<div className='h-full overflow-y-auto px-2 pb-2 custom-scrollbar'>
					<p className='text-[10px] text-text-placeholder font-semibold uppercase tracking-wider px-3 py-2'>
						Recent
					</p>
					{sessions.length === 0 ? (
						<p className='text-text-placeholder text-xs text-center py-6'>
							No investigations yet
						</p>
					) : (
						<div className='space-y-0.5'>
							{sessions.map((s) => {
								const isActive = chatId === s.chat_id;
								return (
									<button
										key={s.chat_id}
										onClick={() => onLoadChat(s)}
										className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all text-left group ${
											isActive
												? 'bg-primary/10 border border-primary/20'
												: 'hover:bg-accent'
										}`}
									>
										<MessageSquare
											size={14}
											className={`mt-0.5 shrink-0 ${isActive ? 'text-primary' : 'text-text-faint'}`}
										/>
										<div className='flex-1 min-w-0'>
											<p
												className={`text-xs font-medium truncate ${
													isActive ? 'text-primary' : 'text-text-tertiary'
												}`}
											>
												{s.title || s.txn_id}
											</p>
											<p className='text-[10px] text-text-placeholder mt-0.5'>
												{s.message_count} messages · {s.txn_id}
											</p>
										</div>
										<button
											onClick={(e) => onDeleteChat(e, s.chat_id)}
											className='opacity-0 group-hover:opacity-100 p-1 rounded text-text-placeholder hover:text-danger transition-all'
										>
											<Trash2 size={16} />
										</button>
									</button>
								);
							})}
						</div>
					)}
				</div>
			</div>
		</aside>
	);
};
