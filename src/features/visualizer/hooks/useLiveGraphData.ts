import { useState, useEffect, useRef, useCallback } from 'react';
import {
	EMPTY_GRAPH,
	buildGraphFromTransactions,
	mergeGraphData,
} from '../constants';
import { getTransactions } from '../../../api';
import type { GraphData } from '../types';

const POLL_INTERVAL = 5000; // 5 seconds
const INITIAL_PAGE_SIZE = 100;
const POLL_PAGE_SIZE = 50;

export function useLiveGraphData() {
	const [graphData, setGraphData] = useState<GraphData>(EMPTY_GRAPH);
	const [loading, setLoading] = useState(true);
	const [isLive, setIsLive] = useState(false);
	const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
	const [newTxnCount, setNewTxnCount] = useState(0);

	const knownTxnIds = useRef(new Set<string>());
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

	// Initial fetch
	useEffect(() => {
		(async () => {
			try {
				const data = await getTransactions({
					page_size: INITIAL_PAGE_SIZE,
					sort_by: 'created_at',
					sort_order: 'desc',
				});
				for (const txn of data.items) {
					knownTxnIds.current.add(txn.txn_id);
				}
				const graph = buildGraphFromTransactions(data.items);
				setGraphData(graph);
				setLastUpdated(new Date());
			} catch (e) {
				console.error('Visualizer: failed to fetch transactions', e);
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	// Poll for new data
	const pollNewData = useCallback(async () => {
		try {
			const data = await getTransactions({
				page_size: POLL_PAGE_SIZE,
				sort_by: 'created_at',
				sort_order: 'desc',
			});

			const newTxns = data.items.filter(
				(txn) => !knownTxnIds.current.has(txn.txn_id),
			);

			if (newTxns.length === 0) return;

			for (const txn of newTxns) {
				knownTxnIds.current.add(txn.txn_id);
			}

			const incomingGraph = buildGraphFromTransactions(newTxns);

			setGraphData((prev) => mergeGraphData(prev, incomingGraph));
			setLastUpdated(new Date());
			setNewTxnCount((prev) => prev + newTxns.length);
		} catch (e) {
			console.error('Visualizer: poll failed', e);
		}
	}, []);

	// Manage polling interval
	useEffect(() => {
		if (isLive && !loading) {
			// Immediately poll once when turning on
			pollNewData();
			intervalRef.current = setInterval(pollNewData, POLL_INTERVAL);
		}

		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
		};
	}, [isLive, loading, pollNewData]);

	const toggleLive = useCallback(() => {
		setIsLive((prev) => !prev);
		setNewTxnCount(0);
	}, []);

	return {
		graphData,
		loading,
		isLive,
		toggleLive,
		lastUpdated,
		newTxnCount,
	};
}
