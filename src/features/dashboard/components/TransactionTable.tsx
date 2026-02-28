import React, { useState, useEffect, useRef } from 'react';
import {
	Search,
	Filter,
	RefreshCw,
	ChevronLeft,
	ChevronRight,
	ChevronDown,
	Loader2,
	X,
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

const FRAUD_TYPE_OPTIONS: {
	value: string;
	label: string;
	color: string;
	dotClass: string;
}[] = [
	{ value: '', label: 'All Types', color: '', dotClass: '' },
	{
		value: 'velocity_attack',
		label: 'Velocity Attack',
		color: 'purple',
		dotClass: 'bg-purple',
	},
	{
		value: 'card_testing',
		label: 'Card Testing',
		color: 'cyan',
		dotClass: 'bg-cyan',
	},
	{
		value: 'collusion_ring',
		label: 'Collusion Ring',
		color: 'pink',
		dotClass: 'bg-pink',
	},
	{
		value: 'geo_anomaly',
		label: 'Geo Anomaly',
		color: 'warning',
		dotClass: 'bg-warning',
	},
	{
		value: 'amount_anomaly',
		label: 'Amount Anomaly',
		color: 'danger',
		dotClass: 'bg-danger',
	},
];

function getRiskBadge(score: number): string {
	if (score >= 0.7) return 'bg-danger-muted text-danger border-danger/30';
	if (score >= 0.3) return 'bg-warning-muted text-warning border-warning/30';
	return 'bg-success-muted text-success border-success/30';
}

function getStatusBadge(txn: Transaction): { label: string; style: string } {
	if (txn.review_status === 'confirmed_fraud')
		return {
			label: '⛔ CONFIRMED',
			style: 'bg-danger-muted text-danger border-danger/30',
		};
	if (txn.review_status === 'false_positive')
		return {
			label: '✅ CLEARED',
			style: 'bg-success-muted text-success border-success/30',
		};
	if (txn.is_flagged)
		return {
			label: '⚠ FLAGGED',
			style: 'bg-warning-muted text-warning border-warning/30',
		};
	return {
		label: 'NORMAL',
		style: 'bg-gray-500/5 text-gray-500 border-gray-500/20',
	};
}

function getFraudTypeBadge(type: string | null): {
	badgeClass: string;
	dotClass: string;
} {
	if (!type) return { badgeClass: '', dotClass: '' };
	const map: Record<string, { badgeClass: string; dotClass: string }> = {
		velocity_attack: {
			badgeClass: 'bg-purple-muted text-purple border-purple/20',
			dotClass: 'bg-purple',
		},
		card_testing: {
			badgeClass: 'bg-info-muted text-cyan border-cyan/20',
			dotClass: 'bg-cyan',
		},
		collusion_ring: {
			badgeClass: 'bg-pink/10 text-pink border-pink/20',
			dotClass: 'bg-pink',
		},
		geo_anomaly: {
			badgeClass: 'bg-warning-muted text-warning border-warning/20',
			dotClass: 'bg-warning',
		},
		amount_anomaly: {
			badgeClass: 'bg-danger-muted text-danger border-danger/20',
			dotClass: 'bg-danger',
		},
	};
	return (
		map[type] || {
			badgeClass: 'bg-muted text-muted-foreground border-border',
			dotClass: 'bg-muted-foreground',
		}
	);
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

	const [localSearch, setLocalSearch] = useState(searchQuery);
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		setLocalSearch(searchQuery);
	}, [searchQuery]);

	const handleSearchInput = (value: string) => {
		setLocalSearch(value);
		if (debounceRef.current) clearTimeout(debounceRef.current);
		debounceRef.current = setTimeout(() => {
			onSearchChange(value);
		}, 400);
	};

	const handleClearSearch = () => {
		setLocalSearch('');
		if (debounceRef.current) clearTimeout(debounceRef.current);
		onSearchChange('');
	};

	useEffect(() => {
		return () => {
			if (debounceRef.current) clearTimeout(debounceRef.current);
		};
	}, []);

	const [dropdownOpen, setDropdownOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(e.target as Node)
			) {
				setDropdownOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const selectedOption =
		FRAUD_TYPE_OPTIONS.find((o) => o.value === fraudType) ||
		FRAUD_TYPE_OPTIONS[0];

	return (
		<>
			<div className='bg-card rounded-3xl p-6 border border-border'>
				<div className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6'>
					<div className='relative flex-1 max-w-2xl'>
						<Search className='absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground' />
						<input
							type='text'
							value={localSearch}
							onChange={(e) => handleSearchInput(e.target.value)}
							placeholder='Search by ID, payer, merchant, city, fraud type...'
							className='w-full bg-background border border-border rounded-full py-3 pl-12 pr-11 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors'
						/>
						{localSearch && (
							<button
								onClick={handleClearSearch}
								className='absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors'
								aria-label='Clear search'
							>
								<X className='size-4' />
							</button>
						)}
					</div>
					<div className='flex items-center gap-3'>
						<div className='relative' ref={dropdownRef}>
							<button
								onClick={() => setDropdownOpen((prev) => !prev)}
								className={`flex items-center gap-2.5 bg-background border rounded-full px-4 h-11 text-sm font-medium transition-all cursor-pointer
									${dropdownOpen ? 'border-primary/50 shadow-[0_0_0_3px_hsla(28,90%,54%,0.08)]' : 'border-border hover:border-primary/30'}`}
							>
								<Filter className='size-4 text-muted-foreground' />
								{selectedOption.dotClass && (
									<span
										className={`size-2.5 rounded-full ${selectedOption.dotClass}`}
									/>
								)}
								<span className='text-foreground'>{selectedOption.label}</span>
								<ChevronDown
									className={`size-4 text-muted-foreground transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
								/>
							</button>
							{dropdownOpen && (
								<div className='absolute right-0 top-[calc(100%+6px)] z-50 w-56 bg-card border border-border rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150'>
									<div className='py-1.5'>
										{FRAUD_TYPE_OPTIONS.map((opt) => (
											<button
												key={opt.value}
												onClick={() => {
													onFraudTypeChange(opt.value);
													setDropdownOpen(false);
												}}
												className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors cursor-pointer
													${
														fraudType === opt.value
															? 'bg-primary/10 text-primary font-semibold'
															: 'text-foreground hover:bg-accent'
													}`}
											>
												{opt.dotClass ? (
													<span
														className={`size-2.5 rounded-full ${opt.dotClass} ${fraudType === opt.value ? 'ring-2 ring-primary/30' : ''}`}
													/>
												) : (
													<span className='size-2.5 rounded-full bg-muted-foreground/30' />
												)}
												<span>{opt.label}</span>
												{fraudType === opt.value && (
													<span className='ml-auto text-primary text-xs'>
														✓
													</span>
												)}
											</button>
										))}
									</div>
								</div>
							)}
						</div>
						<button
							onClick={onRefresh}
							disabled={loading}
							className='flex items-center gap-2 px-5 py-2.5 bg-background border border-border rounded-full text-sm font-medium text-foreground hover:bg-accent transition-colors'
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
							<Loader2 className='size-8 animate-spin text-primary' />
							<span className='ml-3 text-text-muted'>
								Loading transactions...
							</span>
						</div>
					) : transactions.length === 0 ? (
						<div className='flex flex-col items-center justify-center py-20 text-text-faint'>
							<p className='text-lg mb-2'>No transactions yet</p>
							<p className='text-sm'>
								Start the Data Filler or run an Attack Simulation to generate
								data
							</p>
						</div>
					) : (
						<table className='w-full border-collapse'>
							<thead>
								<tr className='text-left border-b border-border'>
									<th className='pb-4 pt-2 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
										Txn ID
									</th>
									<th className='pb-4 pt-2 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
										Payer
									</th>
									<th className='pb-4 pt-2 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
										Merchant · City
									</th>
									<th className='pb-4 pt-2 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
										Amount
									</th>
									<th className='pb-4 pt-2 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
										Risk Score
									</th>
									<th className='pb-4 pt-2 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
										Fraud Type
									</th>
									<th className='pb-4 pt-2 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
										Status
									</th>
								</tr>
							</thead>
							<tbody className='divide-y divide-border'>
								{transactions.map((txn) => {
									const status = getStatusBadge(txn);
									return (
										<tr
											key={txn.txn_id}
											onClick={() => setSelectedTxn(txn)}
											className={`hover:bg-accent transition-colors cursor-pointer ${
												txn.is_flagged ? 'bg-primary/[0.03]' : ''
											}`}
										>
											<td className='py-4 px-4 text-sm text-foreground font-mono'>
												{txn.txn_id}
											</td>
											<td className='py-4 px-4 text-sm text-muted-foreground font-mono'>
												{txn.payer.substring(0, 8)}...
											</td>
											<td className='py-4 px-4 text-sm text-muted-foreground'>
												<span className='text-foreground'>{txn.merchant}</span>
												<span className='text-muted-foreground/40 mx-1'>·</span>
												<span>{txn.city}</span>
											</td>
											<td className='py-4 px-4 text-sm font-semibold text-foreground'>
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
												{txn.fraud_type ? (
													<span
														className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border ${getFraudTypeBadge(txn.fraud_type).badgeClass}`}
													>
														{formatFraudType(txn.fraud_type)}
													</span>
												) : (
													<span className='text-xs text-muted-foreground'>
														—
													</span>
												)}
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
					<div className='flex items-center justify-between mt-6 pt-4 border-t border-border'>
						<p className='text-xs text-text-faint'>
							Page{' '}
							<span className='text-text-tertiary font-medium'>{page}</span> of{' '}
							<span className='text-text-tertiary font-medium'>{pages}</span>
							{' · '}
							<span className='text-text-tertiary font-medium'>
								{total}
							</span>{' '}
							total
						</p>

						<div className='flex items-center gap-1'>
							<button
								onClick={() => onPageChange(Math.max(1, page - 1))}
								disabled={page === 1}
								className='p-2 rounded-lg text-text-muted hover:text-foreground hover:bg-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed'
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
												? 'bg-primary/15 text-primary border border-primary/30'
												: 'text-text-muted hover:bg-accent hover:text-foreground'
										}`}
									>
										{p}
									</button>
								);
							})}

							<button
								onClick={() => onPageChange(Math.min(pages, page + 1))}
								disabled={page === pages}
								className='p-2 rounded-lg text-text-muted hover:text-foreground hover:bg-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed'
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
