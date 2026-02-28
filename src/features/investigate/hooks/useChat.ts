import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as api from '../../../api';
import type { LocalMessage, ChatSession } from '../types';

export function useChat() {
	const { txnId } = useParams<{ txnId: string }>();
	const navigate = useNavigate();

	const [messages, setMessages] = useState<LocalMessage[]>([]);
	const [isTyping, setIsTyping] = useState(false);
	const [isLoadingChat, setIsLoadingChat] = useState(false);
	const [chatId, setChatId] = useState<string | null>(null);
	const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
	const [txnIdInput, setTxnIdInput] = useState('');
	const [showNewChat, setShowNewChat] = useState(true);
	const [recentTxns, setRecentTxns] = useState<api.Transaction[]>([]);
	const scrollRef = useRef<HTMLDivElement>(null);
	const startingTxnRef = useRef<string | null>(null);

	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [messages, isTyping]);

	const loadSessions = useCallback(async () => {
		try {
			const sessions = await api.listChats(undefined, 20);
			setChatSessions(sessions);
		} catch {}
	}, []);

	const loadFlaggedTxns = useCallback(async () => {
		try {
			const data = await api.getTransactions({
				is_flagged: true,
				page_size: 10,
				sort_by: 'risk_score',
				sort_order: 'desc',
			});
			setRecentTxns(data.items);
		} catch {}
	}, []);

	useEffect(() => {
		loadSessions();
		loadFlaggedTxns();
	}, []);

	const handleStartChat = async (id: string, initialMessage?: string) => {
		if (!id.trim()) return;
		if (startingTxnRef.current === id) return;
		startingTxnRef.current = id;

		setShowNewChat(false);
		setMessages([]);
		setIsTyping(true);
		setChatId(null);

		try {
			const reply = await api.startChat(id, initialMessage);
			setChatId(reply.chat_id);

			const msgs: LocalMessage[] = [];
			if (initialMessage) {
				msgs.push({
					id: 'u-0',
					role: 'user',
					content: initialMessage,
					timestamp: new Date(),
				});
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
			setMessages([
				{
					id: 'error',
					role: 'bot',
					content: `❌ Failed to start chat: ${e.message}\n\nMake sure the transaction exists in the database. You can use the Data Filler to generate transactions first.`,
					timestamp: new Date(),
				},
			]);
		} finally {
			setIsTyping(false);
			startingTxnRef.current = null;
		}
	};

	useEffect(() => {
		if (txnId) {
			setTxnIdInput(txnId);
			handleStartChat(txnId);
			navigate('/investigate', { replace: true });
		}
	}, [txnId]);

	const handleSend = async (content: string) => {
		if (!chatId) {
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
			setMessages((prev) => [
				...prev,
				{
					id: `err-${Date.now()}`,
					role: 'bot',
					content: `❌ Error: ${e.message}`,
					timestamp: new Date(),
				},
			]);
		} finally {
			setIsTyping(false);
		}
	};

	const handleLoadChat = async (session: ChatSession) => {
		setShowNewChat(false);
		setMessages([]);
		setIsLoadingChat(true);
		setChatId(session.chat_id);
		try {
			const detail = await api.getChatHistory(session.chat_id);
			setMessages(
				detail.messages.map((m) => ({
					id: `${m.role}-${m.seq}`,
					role: m.role === 'assistant' ? ('bot' as const) : ('user' as const),
					content: m.content,
					reasoning: m.reasoning,
					timestamp: m.created_at ? new Date(m.created_at) : new Date(),
				})),
			);
		} catch {
		} finally {
			setIsLoadingChat(false);
		}
	};

	const handleDeleteChat = async (
		e: React.MouseEvent,
		chatIdToDelete: string,
	) => {
		e.stopPropagation();
		if (!window.confirm('Are you sure you want to delete this investigation?'))
			return;

		try {
			await api.deleteChat(chatIdToDelete);
			if (chatId === chatIdToDelete) {
				setChatId(null);
				setMessages([]);
				setShowNewChat(true);
			}
			loadSessions();
		} catch {}
	};

	const handleNewChat = () => {
		setShowNewChat(true);
		setChatId(null);
		setMessages([]);
	};

	return {
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
	};
}
