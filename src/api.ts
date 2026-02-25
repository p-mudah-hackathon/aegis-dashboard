const API_BASE = '';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
	const res = await fetch(`${API_BASE}${path}`, {
		headers: { 'Content-Type': 'application/json', ...options?.headers },
		...options,
	});
	if (!res.ok) {
		const err = await res.json().catch(() => ({ message: res.statusText }));
		throw new Error(err.message || `API error ${res.status}`);
	}
	return res.json();
}

// ── Types ──────────────────────────────────────────────────────────────
export interface Transaction {
	txn_id: string;
	timestamp: string;
	payer: string;
	issuer: string;
	country: string;
	merchant: string;
	city: string;
	amount_idr: number;
	amount_foreign: number;
	currency: string;
	risk_score: number;
	is_flagged: boolean;
	is_fraud: boolean;
	fraud_type: string | null;
	attack_detail: string | null;
	xai_reasons: XAIFeature[] | null;
	review_status: string | null;
	reviewed_at: string | null;
	review_note: string | null;
	created_at: string | null;
}

export interface XAIFeature {
	feature: string;
	display_name: string;
	importance: number;
}

export interface PaginatedTransactions {
	items: Transaction[];
	total: number;
	page: number;
	page_size: number;
	pages: number;
}

export interface FillerStatus {
	is_running: boolean;
	total_inserted: number;
	started_at: string | null;
	last_txn_at: string | null;
	interval_range: number[];
	fraud_ratio: number;
}

export interface ModelStatus {
	status: string;
	threshold: number;
	mode: string;
	architecture: string;
	aegis_ai_reachable: boolean;
}

export interface ChatSession {
	chat_id: string;
	txn_id: string;
	title: string | null;
	message_count: number;
	created_at: string | null;
	updated_at: string | null;
}

export interface ChatMessage {
	seq: number;
	role: 'system' | 'user' | 'assistant';
	content: string;
	reasoning: string | null;
	created_at: string | null;
}

export interface ChatReply {
	chat_id: string;
	message: ChatMessage;
	total_messages: number;
}

export interface ChatDetail {
	chat_id: string;
	txn_id: string;
	title: string | null;
	messages: ChatMessage[];
	created_at: string | null;
}

export interface StatsSnapshot {
	total: number;
	approved: number;
	flagged: number;
	tp: number;
	fp: number;
	tn: number;
	fn: number;
	recall: number;
	precision: number;
	f1: number;
	fpr: number;
	per_type: Record<string, number>;
	per_type_total: Record<string, number>;
	roi_saved: number;
}

// ── Transactions ───────────────────────────────────────────────────────
export function getTransactions(params: {
	page?: number;
	page_size?: number;
	is_flagged?: boolean;
	fraud_type?: string;
	review_status?: string;
	search?: string;
	min_risk?: number;
	max_risk?: number;
	sort_by?: string;
	sort_order?: string;
} = {}): Promise<PaginatedTransactions> {
	const qs = new URLSearchParams();
	Object.entries(params).forEach(([k, v]) => {
		if (v !== undefined && v !== null) qs.set(k, String(v));
	});
	return request(`/api/v1/transactions?${qs}`);
}

export function getTransaction(txnId: string): Promise<Transaction> {
	return request(`/api/v1/transactions/${txnId}`);
}

export function reviewTransaction(txnId: string, status: string, note?: string) {
	return request(`/api/v1/transactions/${txnId}/review`, {
		method: 'POST',
		body: JSON.stringify({ status, note }),
	});
}

// ── Data Filler ────────────────────────────────────────────────────────
export function startFiller(config?: { min_interval?: number; max_interval?: number; fraud_ratio?: number }): Promise<FillerStatus> {
	return request('/api/v1/filler/start', {
		method: 'POST',
		body: JSON.stringify(config || {}),
	});
}

export function stopFiller(): Promise<FillerStatus> {
	return request('/api/v1/filler/stop', { method: 'POST' });
}

export function getFillerStatus(): Promise<FillerStatus> {
	return request('/api/v1/filler/status');
}

// ── Model Status ───────────────────────────────────────────────────────
export function getModelStatus(): Promise<ModelStatus> {
	return request('/api/v1/model/status');
}

// ── Stats ──────────────────────────────────────────────────────────────
export function getStats(): Promise<StatsSnapshot> {
	return request('/api/v1/stats');
}

// ── Dashboard Counts (global from DB) ───────────────────────────────────────
export interface DashboardCounts {
	total: number;
	flagged: number;
	fraud: number;
	pending_review: number;
	reviewed: number;
}

export function getDashboardCounts(): Promise<DashboardCounts> {
	return request('/api/v1/dashboard/counts');
}

// ── AI Chat ────────────────────────────────────────────────────────────
export function startChat(txnId: string, message?: string): Promise<ChatReply> {
	return request('/api/v1/chat/start', {
		method: 'POST',
		body: JSON.stringify({ txn_id: txnId, message }),
	});
}

export function sendChatMessage(chatId: string, message: string): Promise<ChatReply> {
	return request(`/api/v1/chat/${chatId}`, {
		method: 'POST',
		body: JSON.stringify({ message }),
	});
}

export function getChatHistory(chatId: string): Promise<ChatDetail> {
	return request(`/api/v1/chat/${chatId}`);
}

export function listChats(txnId?: string, limit = 20): Promise<ChatSession[]> {
	const qs = new URLSearchParams({ limit: String(limit) });
	if (txnId) qs.set('txn_id', txnId);
	return request(`/api/v1/chat?${qs}`);
}

export function deleteChat(chatId: string) {
	return request(`/api/v1/chat/${chatId}`, { method: 'DELETE' });
}

// ── Attack Simulation ──────────────────────────────────────────────────
export interface AttackConfig {
	total: number;
	fraud_pct: number;
	speed: 'slow' | 'normal' | 'fast';
}

export interface AttackRun {
	id: number;
	total_txns: number;
	fraud_pct: number;
	speed: string;
	mode: string | null;
	total: number;
	approved: number;
	flagged: number;
	tp: number;
	fp: number;
	tn: number;
	fn: number;
	recall: number;
	precision: number;
	f1: number;
	fpr: number;
	roi_saved: number;
	per_type: Record<string, number> | null;
	per_type_total: Record<string, number> | null;
	status: string;
	started_at: string | null;
	completed_at: string | null;
}

export interface AttackEvent {
	type: 'transaction' | 'stats_update' | 'attack_start' | 'attack_end' | 'log';
	data?: any;
	level?: string;
	text?: string;
}

export function getAttackHistory(limit = 20): Promise<AttackRun[]> {
	return request(`/api/v1/attack/history?limit=${limit}`);
}

export function startAttackRest(config: AttackConfig) {
	return request('/api/v1/attack/start', {
		method: 'POST',
		body: JSON.stringify(config),
	});
}

/** Returns a WebSocket URL for attack streaming */
export function getAttackWsUrl(): string {
	const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
	return `${proto}//${window.location.host}/ws/attack`;
}

// ── Health ──────────────────────────────────────────────────────────────
export function healthCheck(): Promise<{ status: string }> {
	return request('/health');
}
