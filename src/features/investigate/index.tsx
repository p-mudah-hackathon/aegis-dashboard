import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sparkles, Plus, Trash2, MessageSquare, Loader2, Brain } from 'lucide-react';
import { ChatBubble } from './components/ChatBubble';
import { ChatInput } from './components/ChatInput';
import * as api from '../../api';

interface LocalMessage {
	id: string;
	role: 'user' | 'bot';
	content: string;
	reasoning?: string | null;
	timestamp: Date;
}

export const InvestigatePage: React.FC = () => {
	const { txnId } = useParams<{ txnId: string }>();
	const navigate = useNavigate();

	const [messages, setMessages] = useState<LocalMessage[]>([]);
	const [isTyping, setIsTyping] = useState(false);
	const [chatId, setChatId] = useState<string | null>(null);
	const [chatSessions, setChatSessions] = useState<api.ChatSession[]>([]);
	const [txnIdInput, setTxnIdInput] = useState('');
	const [showNewChat, setShowNewChat] = useState(true);
	const [recentTxns, setRecentTxns] = useState<api.Transaction[]>([]);
	const scrollRef = useRef<HTMLDivElement>(null);
	const startingTxnRef = useRef<string | null>(null);

	// Auto-scroll to bottom
	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [messages, isTyping]);

	// Load chat sessions
	const loadSessions = useCallback(async () => {
		try {
			const sessions = await api.listChats(undefined, 20);
			setChatSessions(sessions);
		} catch { }
	}, []);

	// Load flagged transactions for quick-start
	const loadFlaggedTxns = useCallback(async () => {
		try {
			const data = await api.getTransactions({ is_flagged: true, page_size: 10, sort_by: 'risk_score', sort_order: 'desc' });
			setRecentTxns(data.items);
		} catch { }
	}, []);

	useEffect(() => {
		loadSessions();
		loadFlaggedTxns();
	}, []);

	// Auto-start chat if txnId param is provided in URL
	useEffect(() => {
		if (txnId) {
			setTxnIdInput(txnId);
			handleStartChat(txnId);

			// Optional: Remove it from URL without reload so it doesn't double-fire on manual refreshes
			navigate('/investigate', { replace: true });
		}
	}, [txnId]);

	// Start new chat about a transaction
	const handleStartChat = async (txnId: string, initialMessage?: string) => {
		if (!txnId.trim()) return;
		if (startingTxnRef.current === txnId) return; // Prevent StrictMode double-fire
		startingTxnRef.current = txnId;

		setShowNewChat(false);
		setMessages([]);
		setIsTyping(true);
		setChatId(null); // Clear chat ID so it relies strictly on the backend response

		try {
			const reply = await api.startChat(txnId, initialMessage);
			setChatId(reply.chat_id);

			const msgs: LocalMessage[] = [];
			if (initialMessage) {
				msgs.push({ id: `u-0`, role: 'user', content: initialMessage, timestamp: new Date() });
			}
			msgs.push({
				id: `b-${reply.message.seq}`,
				role: 'bot',
				content: reply.message.content,
				reasoning: reply.message.reasoning,
				timestamp: new Date(),
			});
			setMessages(msgs);
			loadSessions();
		} catch (e: any) {
			setChatId(null);
			setShowNewChat(true);
			setMessages([{
				id: 'error',
				role: 'bot',
				content: `❌ Failed to start chat: ${e.message}\n\nMake sure the transaction exists in the database. You can use the Data Filler to generate transactions first.`,
				timestamp: new Date(),
			}]);
		} finally {
			setIsTyping(false);
			startingTxnRef.current = null;
		}
	};

	// Send follow-up message
	const handleSend = async (content: string) => {
		if (!chatId) {
			// If no active chat, try to start one with txn_id from input
			if (txnIdInput) {
				handleStartChat(txnIdInput, content);
			}
			return;
		}

		const userMsg: LocalMessage = {
			id: `u-${Date.now()}`,
			role: 'user',
			content,
			timestamp: new Date(),
		};
		setMessages((prev) => [...prev, userMsg]);
		setIsTyping(true);

		try {
			const reply = await api.sendChatMessage(chatId, content);
			const botMsg: LocalMessage = {
				id: `b-${reply.message.seq}`,
				role: 'bot',
				content: reply.message.content,
				reasoning: reply.message.reasoning,
				timestamp: new Date(),
			};
			setMessages((prev) => [...prev, botMsg]);
		} catch (e: any) {
			setMessages((prev) => [...prev, {
				id: `err-${Date.now()}`,
				role: 'bot',
				content: `❌ Error: ${e.message}`,
				timestamp: new Date(),
			}]);
		} finally {
			setIsTyping(false);
		}
	};

	// Load existing chat
	const handleLoadChat = async (session: api.ChatSession) => {
		setShowNewChat(false);
		setIsTyping(true);
		try {
			const detail = await api.getChatHistory(session.chat_id);
			setChatId(session.chat_id);
			setMessages(detail.messages.map((m, i) => ({
				id: `${m.role}-${m.seq}`,
				role: m.role === 'assistant' ? 'bot' : 'user',
				content: m.content,
				reasoning: m.reasoning,
				timestamp: m.created_at ? new Date(m.created_at) : new Date(),
			})));
		} catch { }
		finally { setIsTyping(false); }
	};

	// Delete chat
	const handleDeleteChat = async (e: React.MouseEvent, chatIdToDelete: string) => {
		e.stopPropagation();
		if (!window.confirm("Are you sure you want to delete this investigation?")) {
			return;
		}
		try {
			await api.deleteChat(chatIdToDelete);
			if (chatId === chatIdToDelete) {
				setChatId(null);
				setMessages([]);
				setShowNewChat(true);
			}
			loadSessions();
		} catch { }
	};

	return (
		<div className='flex-1 flex h-screen overflow-hidden'>
			{/* Left: Chat History Sidebar */}
			<aside className='w-72 bg-[#0f0f0f] border-r border-white/5 flex flex-col'>
				<div className='p-4 border-b border-white/5'>
					<button
						onClick={() => { setShowNewChat(true); setChatId(null); setMessages([]); }}
						className='w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30 rounded-xl text-sm font-bold text-orange-400 hover:from-orange-500/30 hover:to-amber-500/30 transition-all'
					>
						<Plus size={16} />
						New Investigation
					</button>
				</div>

				<div className='flex-1 overflow-y-auto p-3 space-y-1' style={{ scrollbarWidth: 'none' }}>
					{chatSessions.length === 0 ? (
						<p className='text-gray-600 text-xs text-center py-8'>No investigations yet</p>
					) : (
						chatSessions.map((s) => (
							<button
								key={s.chat_id}
								onClick={() => handleLoadChat(s)}
								className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all text-left group ${chatId === s.chat_id
									? 'bg-orange-500/10 border border-orange-500/20'
									: 'hover:bg-white/5'
									}`}
							>
								<MessageSquare size={14} className='text-gray-500 mt-0.5 shrink-0' />
								<div className='flex-1 min-w-0'>
									<p className='text-xs font-medium text-gray-300 truncate'>
										{s.title || s.txn_id}
									</p>
									<p className='text-[10px] text-gray-600 mt-0.5'>
										{s.message_count} messages · {s.txn_id}
									</p>
								</div>
								<button
									onClick={(e) => handleDeleteChat(e, s.chat_id)}
									className='opacity-0 group-hover:opacity-100 p-1 rounded text-gray-600 hover:text-red-400 transition-all'
								>
									<Trash2 size={12} />
								</button>
							</button>
						))
					)}
				</div>
			</aside>

			{/* Right: Chat Area */}
			<div className='flex-1 flex flex-col overflow-hidden'>
				{/* Header */}
				<div className='shrink-0 bg-[#0f0f0f] border-b border-white/5 px-8 py-5'>
					<div className='flex items-center gap-3'>
						<div className='size-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center'>
							<Sparkles size={20} className='text-orange-400' />
						</div>
						<div>
							<h1 className='text-white text-lg font-bold'>
								AEGIS AI Investigator
							</h1>
							<p className='text-gray-500 text-xs'>
								Powered by Qwen 3.5 Plus · Contextual fraud analysis
							</p>
						</div>
						<div className='ml-auto flex items-center gap-2'>
							<div className='size-2 rounded-full bg-green-500 animate-pulse' />
							<span className='text-[11px] text-gray-500'>Online</span>
						</div>
					</div>
				</div>

				{/* Chat / New Chat Picker */}
				{showNewChat ? (
					<div className='flex-1 overflow-y-auto px-8 py-10'
						style={{ background: 'radial-gradient(circle at 30% 20%, rgba(249,115,22,0.03) 0%, transparent 50%), #0a0a0a' }}
					>
						<div className='max-w-2xl mx-auto'>
							<h2 className='text-white text-2xl font-bold mb-2'>Start a New Investigation</h2>
							<p className='text-gray-500 mb-8'>Select a flagged transaction or enter a Transaction ID to investigate with AI</p>

							{/* Manual ID input */}
							<div className='flex gap-3 mb-8'>
								<input
									type='text'
									value={txnIdInput}
									onChange={(e) => setTxnIdInput(e.target.value)}
									placeholder='Enter Transaction ID (e.g. TXN-000042)'
									className='flex-1 bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50'
									onKeyDown={(e) => e.key === 'Enter' && handleStartChat(txnIdInput)}
								/>
								<button
									onClick={() => handleStartChat(txnIdInput)}
									disabled={!txnIdInput.trim()}
									className='px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl text-sm font-bold text-white hover:shadow-lg hover:shadow-orange-500/20 transition-all disabled:opacity-30'
								>
									Investigate
								</button>
							</div>

							{/* Quick-start: flagged transactions */}
							{recentTxns.length > 0 && (
								<>
									<h3 className='text-gray-400 text-xs font-bold uppercase tracking-wider mb-4'>
										⚠ Flagged Transactions — Click to Investigate
									</h3>
									<div className='grid grid-cols-1 gap-3'>
										{recentTxns.map((txn) => (
											<button
												key={txn.txn_id}
												onClick={() => {
													setTxnIdInput(txn.txn_id);
													handleStartChat(txn.txn_id);
												}}
												className='flex items-center gap-4 p-4 bg-[#1a1a1a] border border-white/5 rounded-xl hover:border-orange-500/30 hover:bg-orange-500/5 transition-all text-left group'
											>
												<div className={`text-lg font-bold ${txn.risk_score >= 0.7 ? 'text-red-400' : 'text-orange-400'}`}>
													{(txn.risk_score * 100).toFixed(0)}%
												</div>
												<div className='flex-1'>
													<p className='text-sm font-mono text-gray-300'>{txn.txn_id}</p>
													<p className='text-xs text-gray-500'>
														{txn.merchant} · {txn.city} · IDR {txn.amount_idr.toLocaleString('id-ID')}
														{txn.fraud_type && <span className='text-purple-400 ml-2'>({txn.fraud_type.replace(/_/g, ' ')})</span>}
													</p>
												</div>
												<MessageSquare size={16} className='text-gray-600 group-hover:text-orange-400 transition-colors' />
											</button>
										))}
									</div>
								</>
							)}
						</div>
					</div>
				) : (
					<>
						{/* Messages */}
						<div
							ref={scrollRef}
							className='flex-1 overflow-y-auto px-8 py-6 space-y-5'
							style={{
								background: 'radial-gradient(circle at 30% 20%, rgba(249,115,22,0.03) 0%, transparent 50%), #0a0a0a',
							}}
						>
							{messages.map((msg) => (
								<ChatBubble key={msg.id} message={msg} />
							))}

							{isTyping && <ThinkingIndicator />}
						</div>

						{/* Input */}
						<ChatInput onSend={handleSend} disabled={isTyping} />
					</>
				)}
			</div>
		</div>
	);
};

// ── Thinking Indicator with Timer ───────────────────────────────────────────
const THINKING_STEPS = [
	'Reading transaction data...',
	'Analyzing risk patterns...',
	'Cross-referencing fraud signals...',
	'Generating detailed analysis...',
	'Composing response...',
];

const ThinkingIndicator: React.FC = () => {
	const [elapsed, setElapsed] = useState(0);
	const [stepIdx, setStepIdx] = useState(0);

	useEffect(() => {
		const timer = setInterval(() => setElapsed(s => s + 1), 1000);
		return () => clearInterval(timer);
	}, []);

	useEffect(() => {
		const stepTimer = setInterval(() => {
			setStepIdx(s => Math.min(s + 1, THINKING_STEPS.length - 1));
		}, 3000);
		return () => clearInterval(stepTimer);
	}, []);

	return (
		<div className='flex gap-3'>
			<div className='shrink-0 size-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center'>
				<Brain size={16} className='text-purple-400 animate-pulse' />
			</div>
			<div className='bg-[#1e1e1e] border border-white/5 rounded-2xl rounded-tl-md px-5 py-4 min-w-[300px]'>
				<div className='flex items-center justify-between mb-3'>
					<div className='flex items-center gap-2'>
						<Loader2 size={14} className='animate-spin text-orange-400' />
						<span className='text-xs font-bold text-gray-300'>Qwen 3.5 Plus is thinking</span>
					</div>
					<span className='text-[11px] text-orange-400 font-mono tabular-nums'>{elapsed}s</span>
				</div>
				<div className='space-y-1.5'>
					{THINKING_STEPS.slice(0, stepIdx + 1).map((step, i) => (
						<div key={i} className='flex items-center gap-2 text-[11px]'>
							{i < stepIdx ? (
								<span className='text-green-400'>✓</span>
							) : (
								<span className='size-3 rounded-full border border-orange-400/50 animate-pulse' />
							)}
							<span className={i < stepIdx ? 'text-gray-500' : 'text-gray-300'}>{step}</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};
