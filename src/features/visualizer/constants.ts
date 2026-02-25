import type { GraphData, GraphNode, GraphLink } from './types';
import type { Transaction } from '../../api';

export const NODE_ICONS: Record<string, string> = {
	USER: '👤',
	MERCHANT: '🏪',
	TRANSACTION: '💳',
	ISSUER: '🏦',
	DEVICE: '📱',
};

export const LINK_TYPE_COLORS: Record<string, string> = {
	PAYMENT: 'rgba(249, 115, 22, 0.2)',
	OWNERSHIP: 'rgba(59, 130, 246, 0.2)',
	LOCATION: 'rgba(139, 92, 246, 0.2)',
};

/**
 * Build a force-graph from real transactions.
 * Creates nodes for: payer, merchant, issuer, country, and each transaction.
 * Links: payer → txn (OWNERSHIP), txn → merchant (PAYMENT), txn → issuer (PAYMENT), country → payer (LOCATION).
 */
export function buildGraphFromTransactions(transactions: Transaction[]): GraphData {
	const nodeMap = new Map<string, GraphNode>();
	const links: GraphLink[] = [];

	function getOrCreateNode(
		id: string,
		name: string,
		type: GraphNode['type'],
		opts: { riskScore?: number; val?: number; color?: string } = {},
	): GraphNode {
		if (!nodeMap.has(id)) {
			const defaults: Record<string, { val: number; color: string }> = {
				USER: { val: 16, color: '#3b82f6' },
				MERCHANT: { val: 18, color: '#f59e0b' },
				ISSUER: { val: 14, color: '#10b981' },
				DEVICE: { val: 10, color: '#8b5cf6' },
				TRANSACTION: { val: 12, color: '#6b7280' },
			};
			const d = defaults[type] || { val: 10, color: '#6b7280' };
			nodeMap.set(id, {
				id,
				name,
				type,
				val: opts.val ?? d.val,
				color: opts.color ?? d.color,
				riskScore: opts.riskScore,
			});
		} else if (opts.riskScore !== undefined) {
			const node = nodeMap.get(id)!;
			// Keep the highest risk score
			node.riskScore = Math.max(node.riskScore ?? 0, opts.riskScore);
		}
		return nodeMap.get(id)!;
	}

	for (const txn of transactions) {
		const riskPct = Math.round(txn.risk_score * 100);

		// Color by risk: red > 70, orange > 40, gray otherwise
		let txColor = '#6b7280';
		let txVal = 12;
		if (txn.risk_score >= 0.7) { txColor = '#ef4444'; txVal = 22 + Math.round(txn.risk_score * 10); }
		else if (txn.risk_score >= 0.4) { txColor = '#f97316'; txVal = 16; }

		// Transaction node
		getOrCreateNode(txn.txn_id, txn.txn_id, 'TRANSACTION', {
			riskScore: riskPct,
			val: txVal,
			color: txColor,
		});

		// Payer node
		const payerShort = txn.payer.substring(0, 12);
		getOrCreateNode(`P-${payerShort}`, payerShort, 'USER');

		// Merchant node
		getOrCreateNode(`M-${txn.merchant}`, txn.merchant, 'MERCHANT', {
			riskScore: txn.is_flagged ? riskPct : undefined,
		});

		// Issuer node
		getOrCreateNode(`I-${txn.issuer}`, txn.issuer, 'ISSUER');

		// Country node (acts like geo/device)
		getOrCreateNode(`C-${txn.country}`, txn.country, 'DEVICE');

		// Links
		links.push({
			source: `P-${payerShort}`,
			target: txn.txn_id,
			id: `L-own-${txn.txn_id}`,
			type: 'OWNERSHIP',
			time: txn.timestamp,
		});
		links.push({
			source: txn.txn_id,
			target: `M-${txn.merchant}`,
			id: `L-pay-${txn.txn_id}`,
			type: 'PAYMENT',
			amount: txn.amount_idr,
			currency: 'IDR',
			time: txn.timestamp,
		});
		links.push({
			source: txn.txn_id,
			target: `I-${txn.issuer}`,
			id: `L-iss-${txn.txn_id}`,
			type: 'PAYMENT',
			time: txn.timestamp,
		});
		links.push({
			source: `C-${txn.country}`,
			target: `P-${payerShort}`,
			id: `L-geo-${txn.txn_id}`,
			type: 'LOCATION',
			time: txn.timestamp,
		});
	}

	return {
		nodes: Array.from(nodeMap.values()),
		links,
	};
}

/** Empty graph for initial state */
export const EMPTY_GRAPH: GraphData = { nodes: [], links: [] };
