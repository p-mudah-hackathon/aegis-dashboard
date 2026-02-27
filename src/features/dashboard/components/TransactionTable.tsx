import React, { useState } from 'react';
import {
	Search,
	Filter,
	RefreshCw,
	ChevronLeft,
	ChevronRight,
	Loader2,
} from 'lucide-react';
import type { Transaction } from '../../../api';
import { TransactionDetailModal } from './TransactionDetailModal';

interface TransactionTableProps {
	transactions: Transaction[];
	loading: boolean;
	page: number;
	pages: number;
	total: number;
	onPageChange: (page: number) => void;
	onReview: (txnId: string, status: string) => void;
	onRefresh: () => void;
	searchQuery: string;
	onSearchChange: (q: string) => void;
	fraudType: string;
	onFraudTypeChange: (f: string) => void;
	onInvestigate: (txnId: string) => void;
}

function getRiskBadge(score: number): string {
	if (score >= 0.7) return 'bg-red-500/10 text-red-400 border-red-500/30';
	if (score >= 0.4)
		return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
	return 'bg-green-500/10 text-green-400 border-green-500/30';
}

function getStatusBadge(txn: Transaction): { label: string; style: string } {
	if (txn.review_status === 'confirmed_fraud')
		return {
			label: '⛔ CONFIRMED',
			style: 'bg-red-500/10 text-red-400 border-red-500/30',
		};
	if (txn.review_status === 'false_positive')
		return {
			label: '✅ CLEARED',
			style: 'bg-green-500/10 text-green-400 border-green-500/30',
		};
	if (txn.is_flagged)
		return {
			label: '⚠ FLAGGED',
			style: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
		};
	return {
		label: 'NORMAL',
		style: 'bg-gray-500/5 text-gray-500 border-gray-500/20',
	};
}

function getFraudTypeBadge(type: string | null): string {
	if (!type) return '';
	const colors: Record<string, string> = {
		velocity_attack: 'text-purple-400',
		card_testing: 'text-cyan-400',
		collusion_ring: 'text-pink-400',
		geo_anomaly: 'text-amber-400',
		amount_anomaly: 'text-red-400',
	};
	return colors[type] || 'text-gray-400';
}

function formatFraudType(type: string | null): string {
	if (!type) return '—';
	return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
	transactions,
	loading,
	page,
	pages,
	total,
	searchQuery,
	onSearchChange,
	fraudType,
	onFraudTypeChange,
	onPageChange,
	onReview,
	onRefresh,
	onInvestigate,
}) => {
	const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);

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
							onChange={(e) => onSearchChange(e.target.value)}
							placeholder='Search by ID, payer, merchant, city, fraud type...'
							className='w-full bg-[#121212] border border-white/5 rounded-full py-3 pl-12 pr-6 text-sm text-gray-300 focus:outline-none focus:border-orange-500/50 transition-colors'
						/>
					</div>
					<div className='flex items-center gap-3'>
						<div className='relative flex items-center bg-[#121212] border border-white/5 rounded-full px-4 h-11 transition-colors hover:border-orange-500/30 focus-within:border-orange-500/50'>
							<Filter className='size-4 text-gray-500 mr-2' />
							<select
								value={fraudType}
								onChange={(e) => onFraudTypeChange(e.target.value)}
								className='bg-transparent text-sm text-gray-300 outline-none appearance-none pr-6 cursor-pointer'
							>
								<option className='bg-[#1a1a1a] text-white' value=''>
									All Types
								</option>
								<option
									className='bg-[#1a1a1a] text-white'
									value='velocity_attack'
								>
									Velocity Attack
								</option>
								<option
									className='bg-[#1a1a1a] text-white'
									value='card_testing'
								>
									Card Testing
								</option>
								<option
									className='bg-[#1a1a1a] text-white'
									value='collusion_ring'
								>
									Collusion Ring
								</option>
								<option className='bg-[#1a1a1a] text-white' value='geo_anomaly'>
									Geo Anomaly
								</option>
								<option
									className='bg-[#1a1a1a] text-white'
									value='amount_anomaly'
								>
									Amount Anomaly
								</option>
							</select>
						</div>
						<button
							onClick={onRefresh}
							disabled={loading}
							className='flex items-center gap-2 px-5 py-2.5 bg-[#121212] border border-white/5 rounded-full text-sm font-medium text-gray-300 hover:bg-white/5 transition-colors'
						>
							{loading ? (
								<Loader2 className='size-4 animate-spin' />
							) : (
								<RefreshCw className='size-4' />
							)}
							Refresh
						</button>
					</div>
				</div>

				{/* Table */}
				<div className='overflow-x-auto'>
					{loading && transactions.length === 0 ? (
						<div className='flex items-center justify-center py-20'>
							<Loader2 className='size-8 animate-spin text-orange-500' />
							<span className='ml-3 text-gray-400'>
								Loading transactions...
							</span>
						</div>
					) : transactions.length === 0 ? (
						<div className='flex flex-col items-center justify-center py-20 text-gray-500'>
							<p className='text-lg mb-2'>No transactions yet</p>
							<p className='text-sm'>
								Start the Data Filler or run an Attack Simulation to generate
								data
							</p>
						</div>
					) : (
						<table className='w-full border-collapse'>
							<thead>
								<tr className='text-left border-b border-white/10'>
									<th className='pb-4 pt-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider'>
										Txn ID
									</th>
									<th className='pb-4 pt-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider'>
										Payer
									</th>
									<th className='pb-4 pt-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider'>
										Merchant · City
									</th>
									<th className='pb-4 pt-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider'>
										Amount
									</th>
									<th className='pb-4 pt-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider'>
										Risk Score
									</th>
									<th className='pb-4 pt-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider'>
										Fraud Type
									</th>
									<th className='pb-4 pt-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider'>
										Status
									</th>
								</tr>
							</thead>
							<tbody className='divide-y divide-white/5'>
								{transactions.map((txn) => {
									const status = getStatusBadge(txn);
									return (
										<tr
											key={txn.txn_id}
											onClick={() => setSelectedTxn(txn)}
											className={`hover:bg-white/[0.04] transition-colors cursor-pointer ${
												txn.is_flagged ? 'bg-orange-500/[0.03]' : ''
											}`}
										>
											<td className='py-4 px-4 text-sm text-gray-300 font-mono'>
												{txn.txn_id}
											</td>
											<td className='py-4 px-4 text-sm text-gray-400 font-mono'>
												{txn.payer.substring(0, 8)}...
											</td>
											<td className='py-4 px-4 text-sm text-gray-400'>
												<span className='text-gray-300'>{txn.merchant}</span>
												<span className='text-gray-600 mx-1'>·</span>
												<span>{txn.city}</span>
											</td>
											<td className='py-4 px-4 text-sm font-semibold text-gray-200'>
												IDR {txn.amount_idr.toLocaleString('id-ID')}
											</td>
											<td className='py-4 px-4 text-sm'>
												<span
													className={`inline-flex items-center px-3 py-1.5 rounded-lg text-[10px] font-bold border ${getRiskBadge(txn.risk_score)}`}
												>
													{(txn.risk_score * 100).toFixed(1)}%
												</span>
											</td>
											<td className='py-4 px-4 text-sm'>
												<span
													className={`text-xs font-medium ${getFraudTypeBadge(txn.fraud_type)}`}
												>
													{formatFraudType(txn.fraud_type)}
												</span>
											</td>
											<td className='py-4 px-4 text-sm'>
												<span
													className={`inline-flex items-center px-3 py-1.5 rounded-lg text-[10px] font-bold border ${status.style}`}
												>
													{status.label}
												</span>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					)}
				</div>

				{/* Pagination */}
				{pages > 0 && (
					<div className='flex items-center justify-between mt-6 pt-4 border-t border-white/5'>
						<p className='text-xs text-gray-500'>
							Page <span className='text-gray-300 font-medium'>{page}</span> of{' '}
							<span className='text-gray-300 font-medium'>{pages}</span>
							{' · '}
							<span className='text-gray-300 font-medium'>{total}</span> total
						</p>

						<div className='flex items-center gap-1'>
							<button
								onClick={() => onPageChange(Math.max(1, page - 1))}
								disabled={page === 1}
								className='p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed'
							>
								<ChevronLeft size={16} />
							</button>

							{Array.from({ length: Math.min(pages, 7) }, (_, i) => {
								let p: number;
								if (pages <= 7) p = i + 1;
								else if (page <= 4) p = i + 1;
								else if (page >= pages - 3) p = pages - 6 + i;
								else p = page - 3 + i;
								return (
									<button
										key={p}
										onClick={() => onPageChange(p)}
										className={`size-8 rounded-lg text-xs font-semibold transition-colors ${
											p === page
												? 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
												: 'text-gray-400 hover:bg-white/5 hover:text-white'
										}`}
									>
										{p}
									</button>
								);
							})}

							<button
								onClick={() => onPageChange(Math.min(pages, page + 1))}
								disabled={page === pages}
								className='p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed'
							>
								<ChevronRight size={16} />
							</button>
						</div>
					</div>
				)}
			</div>

			{/* Detail Modal */}
			{selectedTxn && (
				<TransactionDetailModal
					transaction={selectedTxn}
					onClose={() => setSelectedTxn(null)}
					onReview={onReview}
					onInvestigate={onInvestigate}
				/>
			)}
		</>
	);
};
