import React, { useState } from 'react';
import { useChat } from './hooks/useChat';
import { ChatSidebar } from './components/ChatSidebar';
import { ChatHeader } from './components/ChatHeader';
import { NewChatView } from './components/NewChatView';
import { ChatBubble } from './components/ChatBubble';
import { ChatInput } from './components/ChatInput';
import { ThinkingIndicator } from './components/ThinkingIndicator';
import { ChatLoadingSkeleton } from './components/ChatLoadingSkeleton';

export const InvestigatePage: React.FC = () => {
	const {
		messages,
		isTyping,
		isLoadingChat,
		chatId,
		chatSessions,
		txnIdInput,
		setTxnIdInput,
		showNewChat,
		recentTxns,
		scrollRef,
		handleStartChat,
		handleSend,
		handleLoadChat,
		handleDeleteChat,
		handleNewChat,
	} = useChat();

	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

	const activeTitle = chatId
		? chatSessions.find((s) => s.chat_id === chatId)?.title ||
			chatSessions.find((s) => s.chat_id === chatId)?.txn_id
		: undefined;

	return (
		<div className='flex-1 flex h-screen overflow-hidden'>
			<ChatSidebar
				chatId={chatId}
				sessions={chatSessions}
				collapsed={sidebarCollapsed}
				onToggle={() => setSidebarCollapsed((v) => !v)}
				onNewChat={handleNewChat}
				onLoadChat={handleLoadChat}
				onDeleteChat={handleDeleteChat}
			/>

			<div className='flex-1 flex flex-col overflow-hidden'>
				<ChatHeader title={activeTitle} />

				{showNewChat ? (
					<NewChatView
						txnIdInput={txnIdInput}
						onTxnIdChange={setTxnIdInput}
						onStartChat={handleStartChat}
						recentTxns={recentTxns}
					/>
				) : (
					<>
						{isLoadingChat ? (
							<ChatLoadingSkeleton />
						) : (
							<div
								ref={scrollRef}
								className='flex-1 overflow-y-auto px-8 py-6 space-y-5 custom-scrollbar'
								style={{
									background:
										'radial-gradient(circle at 30% 20%, rgba(249,115,22,0.03) 0%, transparent 50%), #0a0a0a',
								}}
							>
								{messages.map((msg) => (
									<ChatBubble key={msg.id} message={msg} />
								))}
								{isTyping && <ThinkingIndicator />}
							</div>
						)}

						<ChatInput
							onSend={handleSend}
							disabled={isTyping || isLoadingChat}
						/>
					</>
				)}
			</div>
		</div>
	);
};
