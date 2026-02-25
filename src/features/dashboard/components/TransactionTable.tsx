import React, { useState, useMemo } from 'react';
import {
	Search,
	Filter,
	Download,
	ChevronLeft,
	ChevronRight,
} from 'lucide-react';
import type { Transaction, TransactionStatus } from '../types';
import { TransactionDetailModal } from './TransactionDetailModal';

interface TransactionTableProps {
	transactions: Transaction[];
	onStatusChange: (txnId: string, status: TransactionStatus) => void;
}

const ITEMS_PER_PAGE = 10;

const STATUS_STYLES: Record<TransactionStatus, string> = {
	PENDING: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
	APPROVED: 'bg-green-500/10 text-green-400 border-green-500/30',
	FLAGGED: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
	BLOCKED: 'bg-[#ff4d4d]/10 text-[#ff4d4d] border-[#ff4d4d]/30',
};

const STATUS_ROW_BG: Record<TransactionStatus, string> = {
	PENDING: 'bg-yellow-500/[0.03]',
	APPROVED: '',
	FLAGGED: 'bg-orange-500/[0.04]',
	BLOCKED: 'bg-[#ff4d4d]/[0.04]',
};

function formatTimestamp(iso: string): string {
	const d = new Date(iso);
	const day = d.getDate().toString().padStart(2, '0');
	const months = [
		'Jan',
		'Feb',
		'Mar',
		'Apr',
		'May',
		'Jun',
		'Jul',
		'Aug',
		'Sep',
		'Oct',
		'Nov',
		'Dec',
	];
	const month = months[d.getMonth()];
	const year = d.getFullYear().toString().slice(-2);
	const hours = d.getHours().toString().padStart(2, '0');
	const mins = d.getMinutes().toString().padStart(2, '0');
	return `${day} ${month} '${year}, ${hours}:${mins}`;
}

function getRiskBadge(score: number): string {
	if (score >= 0.7) return 'bg-red-500/10 text-red-400 border-red-500/30';
	if (score >= 0.4)
		return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
	return 'bg-green-500/10 text-green-400 border-green-500/30';
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
	transactions,
	onStatusChange,
}) => {
	const [currentPage, setCurrentPage] = useState(1);
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);

	// Filter transactions by search
	const filtered = useMemo(() => {
		if (!searchQuery.trim()) return transactions;
		const q = searchQuery.toLowerCase();
		return transactions.filter(
			(t) =>
				t.txnId.toLowerCase().includes(q) ||
				t.userId.toLowerCase().includes(q) ||
				t.merchantId.toLowerCase().includes(q) ||
				t.merchantCity.toLowerCase().includes(q) ||
				t.issuerId.toLowerCase().includes(q),
		);
	}, [transactions, searchQuery]);

	const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
	const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
	const pageData = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

	// Reset to page 1 when search changes
	const handleSearch = (value: string) => {
		setSearchQuery(value);
		setCurrentPage(1);
	};

	// Keep selectedTxn in sync with latest data (for status changes)
	const activeSelectedTxn = selectedTxn
		? transactions.find((t) => t.txnId === selectedTxn.txnId) || null
		: null;

	return (
		<>
			<div className='bg-[#1a1a1a] rounded-3xl p-6 border border-white/5'>
				{/* Toolbar */}
				<div className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6'>
					<div className='relative flex-1 max-w-2xl'>
						<Search className='absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-500' />
						<input
							type='text'
							value={searchQuery}
							onChange={(e) => handleSearch(e.target.value)}
							placeholder='Search by Transaction ID, User, Merchant...'
							className='w-full bg-[#121212] border border-white/5 rounded-full py-3 pl-12 pr-6 text-sm text-gray-300 focus:outline-none focus:border-orange-500/50 transition-colors'
						/>
					</div>
					<div className='flex items-center gap-3'>
						<button className='flex items-center gap-2 px-5 py-2.5 bg-[#121212] border border-white/5 rounded-full text-sm font-medium text-gray-300 hover:bg-white/5 transition-colors'>
							<Filter className='size-4' />
							Filter
						</button>
						<button className='flex items-center gap-2 px-5 py-2.5 bg-[#121212] border border-white/5 rounded-full text-sm font-medium text-gray-300 hover:bg-white/5 transition-colors'>
							<Download className='size-4' />
							Export
						</button>
					</div>
				</div>

				{/* Table */}
				<div className='overflow-x-auto'>
					<table className='w-full border-collapse'>
						<thead>
							<tr className='text-left border-b border-white/10'>
								<th className='pb-4 pt-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider'>
									Transaction ID
								</th>
								<th className='pb-4 pt-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider'>
									Timestamp
								</th>
								<th className='pb-4 pt-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider'>
									User ID
								</th>
								<th className='pb-4 pt-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider'>
									Merchant
								</th>
								<th className='pb-4 pt-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider'>
									Amount
								</th>
								<th className='pb-4 pt-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider'>
									Risk Score
								</th>
								<th className='pb-4 pt-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider'>
									Status
								</th>
							</tr>
						</thead>
						<tbody className='divide-y divide-white/5'>
							{pageData.map((txn) => (
								<tr
									key={txn.txnId}
									onClick={() => setSelectedTxn(txn)}
									className={`hover:bg-white/[0.04] transition-colors cursor-pointer ${STATUS_ROW_BG[txn.status]}`}
								>
									<td className='py-4 px-4 text-sm text-gray-300 font-mono'>
										{txn.txnId}
									</td>
									<td className='py-4 px-4 text-sm text-gray-400'>
										{formatTimestamp(txn.timestamp)}
									</td>
									<td className='py-4 px-4 text-sm text-gray-300 font-mono'>
										{txn.userId}
									</td>
									<td className='py-4 px-4 text-sm text-gray-400'>
										<span className='font-mono text-gray-300'>
											{txn.merchantId}
										</span>
										<span className='text-gray-600 mx-1'>·</span>
										<span>{txn.merchantCity}</span>
									</td>
									<td className='py-4 px-4 text-sm font-semibold text-gray-200'>
										IDR {txn.amountIdr.toLocaleString('id-ID')}
									</td>
									<td className='py-4 px-4 text-sm'>
										<span
											className={`inline-flex items-center px-3 py-1.5 rounded-lg text-[10px] font-bold border ${getRiskBadge(txn.merchantRiskScore)}`}
										>
											{(txn.merchantRiskScore * 100).toFixed(1)}%
										</span>
									</td>
									<td className='py-4 px-4 text-sm'>
										<span
											className={`inline-flex items-center px-3 py-1.5 rounded-lg text-[10px] font-bold border ${STATUS_STYLES[txn.status]}`}
										>
											{txn.status}
										</span>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				{/* Pagination */}
				<div className='flex items-center justify-between mt-6 pt-4 border-t border-white/5'>
					<p className='text-xs text-gray-500'>
						Showing{' '}
						<span className='text-gray-300 font-medium'>
							{startIndex + 1}–
							{Math.min(startIndex + ITEMS_PER_PAGE, filtered.length)}
						</span>{' '}
						of{' '}
						<span className='text-gray-300 font-medium'>{filtered.length}</span>{' '}
						transactions
					</p>

					<div className='flex items-center gap-1'>
						<button
							onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
							disabled={currentPage === 1}
							className='p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed'
						>
							<ChevronLeft size={16} />
						</button>

						{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
							<button
								key={page}
								onClick={() => setCurrentPage(page)}
								className={`size-8 rounded-lg text-xs font-semibold transition-colors ${
									page === currentPage
										? 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
										: 'text-gray-400 hover:bg-white/5 hover:text-white'
								}`}
							>
								{page}
							</button>
						))}

						<button
							onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
							disabled={currentPage === totalPages}
							className='p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed'
						>
							<ChevronRight size={16} />
						</button>
					</div>
				</div>
			</div>

			{/* Detail Modal */}
			{activeSelectedTxn && (
				<TransactionDetailModal
					transaction={activeSelectedTxn}
					onClose={() => setSelectedTxn(null)}
					onStatusChange={(txnId, status) => {
						onStatusChange(txnId, status);
					}}
				/>
			)}
		</>
	);
};
