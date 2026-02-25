import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from './components/Header';
import { StatCard } from './components/StatCard';
import { TransactionTable } from './components/TransactionTable';
import type { Transaction as APITransaction, PaginatedTransactions, DashboardCounts } from '../../api';
import { getTransactions, reviewTransaction, getFillerStatus, startFiller, stopFiller, getModelStatus, getDashboardCounts, type FillerStatus, type ModelStatus } from '../../api';
import { Activity, AlertTriangle, ShieldBan, Clock, Database, Cpu, Play, Square, Loader2 } from 'lucide-react';

export const DashboardPage: React.FC = () => {
	const navigate = useNavigate();
	const [transactions, setTransactions] = useState<APITransaction[]>([]);
	const [total, setTotal] = useState(0);
	const [page, setPage] = useState(1);
	const [pages, setPages] = useState(1);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState('');
	const [fraudType, setFraudType] = useState<string>('');
	const [filler, setFiller] = useState<FillerStatus | null>(null);
	const [model, setModel] = useState<ModelStatus | null>(null);
	const [fillerLoading, setFillerLoading] = useState(false);
	const [counts, setCounts] = useState<DashboardCounts>({ total: 0, flagged: 0, fraud: 0, pending_review: 0, reviewed: 0 });
	const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

	// Fetch transactions
	const fetchTransactions = useCallback(async (p = page, q = searchQuery, fType = fraudType) => {
		setLoading(true);
		try {
			const data: PaginatedTransactions = await getTransactions({
				page: p,
				page_size: 15,
				sort_by: 'created_at',
				sort_order: 'desc',
				search: q,
				fraud_type: fType || undefined
			});
			setTransactions(data.items);
			setTotal(data.total);
			setPages(data.pages);
		} catch (e) {
			console.error('Failed to fetch transactions:', e);
		} finally {
			setLoading(false);
		}
	}, [page]);

	// Fetch global counts from DB
	const fetchCounts = useCallback(async () => {
		try {
			const c = await getDashboardCounts();
			setCounts(c);
		} catch (e) {
			console.error('Failed to fetch counts:', e);
		}
	}, []);

	// Initial load
	useEffect(() => {
		fetchTransactions(page);
		fetchCounts();
		getFillerStatus().then(setFiller).catch(() => { });
		getModelStatus().then(setModel).catch(() => { });
	}, [page]);

	// Auto-refresh when filler is running
	useEffect(() => {
		if (filler?.is_running) {
			pollRef.current = setInterval(() => {
				fetchTransactions(page);
				fetchCounts();
				getFillerStatus().then(setFiller).catch(() => { });
			}, 4000);
		}
		return () => { if (pollRef.current) clearInterval(pollRef.current); };
	}, [filler?.is_running, page]);

	const handleToggleFiller = async () => {
		setFillerLoading(true);
		try {
			if (filler?.is_running) {
				const s = await stopFiller();
				setFiller(s);
			} else {
				const s = await startFiller({ min_interval: 2, max_interval: 5, fraud_ratio: 0.08 });
				setFiller(s);
			}
		} catch (e) {
			console.error('Filler toggle failed:', e);
		} finally {
			setFillerLoading(false);
		}
	};

	const handleReview = async (txnId: string, status: string) => {
		try {
			await reviewTransaction(txnId, status);
			fetchTransactions(page);
			fetchCounts();
		} catch (e) {
			console.error('Review failed:', e);
		}
	};

	return (
		<div className='flex-1 p-10 overflow-y-auto'>
			<Header />

			{/* System Status Bar */}
			<div className='flex items-center gap-4 mb-6'>
				<div className='flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] rounded-xl border border-white/5'>
					<Cpu size={14} className={model?.aegis_ai_reachable ? 'text-green-400' : 'text-red-400'} />
					<span className='text-xs text-gray-400'>
						HTGNN: <span className={model?.aegis_ai_reachable ? 'text-green-400' : 'text-red-400'}>
							{model?.mode || 'UNKNOWN'}
						</span>
					</span>
					{model?.threshold && (
						<span className='text-[10px] text-gray-600 ml-1'>θ={model.threshold.toFixed(3)}</span>
					)}
				</div>

				<button
					onClick={handleToggleFiller}
					disabled={fillerLoading}
					className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold border transition-all ${filler?.is_running
						? 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20'
						: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
						} disabled:opacity-50`}
				>
					{fillerLoading ? (
						<Loader2 size={14} className='animate-spin' />
					) : filler?.is_running ? (
						<Square size={14} />
					) : (
						<Play size={14} />
					)}
					{filler?.is_running ? 'Stop Data Fill' : 'Start Data Fill'}
				</button>

				{filler?.is_running && (
					<div className='flex items-center gap-2 px-3 py-2 bg-emerald-500/5 rounded-xl border border-emerald-500/20'>
						<Database size={12} className='text-emerald-400 animate-pulse' />
						<span className='text-[11px] text-emerald-300 font-mono'>
							{filler.total_inserted} inserted
						</span>
					</div>
				)}

				<div className='ml-auto flex items-center gap-2 px-3 py-2 bg-[#1a1a1a] rounded-xl border border-white/5'>
					<Database size={12} className='text-gray-500' />
					<span className='text-xs text-gray-400'>
						<span className='text-white font-bold'>{counts.total.toLocaleString()}</span> in database
					</span>
				</div>
			</div>

			{/* Stats Cards — using GLOBAL counts from DB */}
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10'>
				<StatCard
					title='Total Transactions'
					value={counts.total.toLocaleString()}
					label='Monitored'
					subtitle='QRIS payments in database'
					icon={Activity}
					borderColor='border-blue-500/50'
					iconBgColor='bg-blue-500/10'
					iconColor='text-blue-500'
				/>
				<StatCard
					title='Pending Review'
					value={counts.pending_review.toLocaleString()}
					label='Transactions'
					subtitle='Flagged, awaiting analyst decision'
					icon={Clock}
					borderColor='border-yellow-500/50'
					iconBgColor='bg-yellow-500/10'
					iconColor='text-yellow-500'
				/>
				<StatCard
					title='Flagged Activity'
					value={counts.flagged.toLocaleString()}
					label='Flagged'
					subtitle='High risk score by HTGNN model'
					icon={AlertTriangle}
					borderColor='border-orange-500/50'
					iconBgColor='bg-orange-500/10'
					iconColor='text-orange-500'
				/>
				<StatCard
					title='Confirmed Fraud'
					value={counts.fraud.toLocaleString()}
					label='Detected'
					subtitle='Analyst confirmed fraud'
					icon={ShieldBan}
					borderColor='border-[#ff4d4d]/50'
					iconBgColor='bg-[#ff4d4d]/10'
					iconColor='text-[#ff4d4d]'
				/>
			</div>

			{/* Transaction Table */}
			<TransactionTable
				transactions={transactions}
				loading={loading}
				page={page}
				pages={pages}
				total={total}
				searchQuery={searchQuery}
				onSearchChange={(q) => {
					setSearchQuery(q);
					setPage(1);
					fetchTransactions(1, q, fraudType);
				}}
				fraudType={fraudType}
				onFraudTypeChange={(f) => {
					setFraudType(f);
					setPage(1);
					fetchTransactions(1, searchQuery, f);
				}}
				onPageChange={(p) => {
					setPage(p);
					fetchTransactions(p, searchQuery, fraudType);
				}}
				onReview={handleReview}
				onRefresh={() => { fetchTransactions(page, searchQuery, fraudType); fetchCounts(); }}
				onInvestigate={(id) => navigate('/investigate/' + id)}
			/>
		</div>
	);
};
