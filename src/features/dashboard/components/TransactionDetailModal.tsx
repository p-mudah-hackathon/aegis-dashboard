import React, { useState, useEffect } from 'react';
import {
	X,
	ShieldCheck,
	ShieldBan,
	AlertTriangle,
	Store,
	Activity,
	Sparkles,
} from 'lucide-react';
import type { Transaction } from '../../../api';
import { MiniGraphVisualizer } from './MiniGraphVisualizer';

interface TransactionDetailModalProps {
	transaction: Transaction;
	onClose: () => void;
	onReview: (txnId: string, status: string) => void;
	onInvestigate: (txnId: string) => void;
}

function getRiskColor(score: number): string {
	if (score >= 0.7) return 'text-red-400';
	if (score >= 0.4) return 'text-orange-400';
	return 'text-green-400';
}

const InfoRow: React.FC<{
	label: string;
	value: string | number;
	highlight?: boolean;
}> = ({ label, value, highlight }) => (
	<div className='flex justify-between items-center py-1.5'>
		<span className='text-[11px] text-gray-500'>{label}</span>
		<span
			className={`text-[12px] font-medium ${highlight ? 'text-orange-400' : 'text-gray-200'}`}
		>
			{value}
		</span>
	</div>
);

/* ── Skeleton shimmer ──────────────────────────────────────────────── */
const SkeletonBlock: React.FC<{ className?: string }> = ({
	className = '',
}) => (
	<div className={`animate-pulse bg-white/[0.04] rounded-lg ${className}`} />
);

const ModalSkeleton: React.FC = () => (
	<div className='space-y-4'>
		{/* Risk score skeleton */}
		<div className='flex items-center gap-4 p-4 bg-white/[0.02] rounded-xl border border-white/5'>
			<SkeletonBlock className='w-20 h-10 rounded-xl' />
			<div className='space-y-2 flex-1'>
				<SkeletonBlock className='w-28 h-3' />
				<SkeletonBlock className='w-20 h-4' />
			</div>
		</div>
		{/* Two-column skeleton */}
		<div className='grid grid-cols-2 gap-4'>
			<div className='bg-white/[0.02] rounded-xl p-4 border border-white/5 space-y-3'>
				<SkeletonBlock className='w-24 h-3' />
				{[...Array(5)].map((_, i) => (
					<div key={i} className='flex justify-between'>
						<SkeletonBlock className='w-14 h-2.5' />
						<SkeletonBlock className='w-20 h-2.5' />
					</div>
				))}
			</div>
			<div className='bg-white/[0.02] rounded-xl p-4 border border-white/5 space-y-3'>
				<SkeletonBlock className='w-32 h-3' />
				{[...Array(4)].map((_, i) => (
					<div key={i} className='space-y-1.5'>
						<div className='flex justify-between'>
							<SkeletonBlock className='w-24 h-2.5' />
							<SkeletonBlock className='w-8 h-2.5' />
						</div>
						<SkeletonBlock className='w-full h-1.5' />
					</div>
				))}
			</div>
		</div>
		{/* Graph skeleton */}
		<div className='bg-white/[0.02] rounded-xl border border-white/5 overflow-hidden'>
			<div className='px-4 pt-3 pb-2'>
				<SkeletonBlock className='w-28 h-3' />
			</div>
			<SkeletonBlock className='w-full h-[200px] rounded-none' />
			<div className='px-4 py-2.5 flex gap-4'>
				{[...Array(5)].map((_, i) => (
					<SkeletonBlock key={i} className='w-12 h-2.5' />
				))}
			</div>
		</div>
		{/* Action skeleton */}
		<SkeletonBlock className='w-full h-11 rounded-xl' />
		<div className='flex gap-3'>
			<SkeletonBlock className='flex-1 h-10 rounded-xl' />
			<SkeletonBlock className='flex-1 h-10 rounded-xl' />
		</div>
	</div>
);

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
	transaction: txn,
	onClose,
	onReview,
	onInvestigate,
}) => {
	const isHighRisk = txn.risk_score >= 0.7;

	// Brief loading skeleton for smooth transition UX
	const [showContent, setShowContent] = useState(false);
	useEffect(() => {
		const timer = setTimeout(() => setShowContent(true), 350);
		return () => clearTimeout(timer);
	}, [txn.txn_id]);

	return (
		<div
			className='fixed inset-0 z-50 flex items-center justify-center p-4'
			onClick={onClose}
		>
			<div className='absolute inset-0 bg-black/60 backdrop-blur-sm' />
			<div
				className='relative bg-[#121212] border border-white/10 rounded-2xl w-full max-w-[800px] max-h-[85vh] shadow-[0_30px_80px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200'
				onClick={(e) => e.stopPropagation()}
			>
				{/* Header */}
				<div className='shrink-0 bg-[#121212] border-b border-white/5 px-6 py-4 flex items-center justify-between'>
					<div>
						<div className='flex items-center gap-3'>
							<h2 className='text-white font-bold text-lg font-mono'>
								{txn.txn_id}
							</h2>
							{txn.is_flagged && (
								<span className='inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-bold border bg-orange-500/10 text-orange-400 border-orange-500/30'>
									⚠ FLAGGED
								</span>
							)}
							{txn.is_fraud && (
								<span className='inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-bold border bg-red-500/10 text-red-400 border-red-500/30'>
									FRAUD
								</span>
							)}
						</div>
						<p className='text-gray-500 text-xs mt-0.5'>{txn.timestamp}</p>
					</div>
					<div className='flex items-center gap-3'>
						<span className='text-white font-bold text-lg'>
							IDR {txn.amount_idr.toLocaleString('id-ID')}
						</span>
						<button
							onClick={onClose}
							className='p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors'
						>
							<X size={18} />
						</button>
					</div>
				</div>

				{/* Body */}
				<div
					className='flex-1 overflow-y-auto px-6 py-4 space-y-4'
					style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
				>
					{!showContent ? (
						<ModalSkeleton />
					) : (
						<>
							{/* Risk Score */}
							<div className='flex items-center gap-4 p-4 bg-white/[0.02] rounded-xl border border-white/5'>
								<div
									className={`text-3xl font-bold ${getRiskColor(txn.risk_score)}`}
								>
									{(txn.risk_score * 100).toFixed(1)}%
								</div>
								<div>
									<p className='text-xs text-gray-400'>HTGNN Risk Score</p>
									<p
										className={`text-sm font-bold ${getRiskColor(txn.risk_score)}`}
									>
										{txn.risk_score >= 0.7
											? 'HIGH RISK'
											: txn.risk_score >= 0.4
												? 'MEDIUM RISK'
												: 'LOW RISK'}
									</p>
								</div>
								{txn.fraud_type && (
									<div className='ml-auto px-3 py-1.5 bg-purple-500/10 rounded-lg border border-purple-500/20'>
										<p className='text-[10px] text-purple-300 uppercase tracking-wider'>
											Fraud Type
										</p>
										<p className='text-sm font-bold text-purple-400'>
											{txn.fraud_type
												.replace(/_/g, ' ')
												.replace(/\b\w/g, (c) => c.toUpperCase())}
										</p>
									</div>
								)}
							</div>

							<div className='grid grid-cols-2 gap-4'>
								{/* Payment Info */}
								<div className='bg-white/[0.02] rounded-xl p-4 border border-white/5'>
									<div className='flex items-center gap-2 mb-3'>
										<Store size={14} className='text-amber-400' />
										<span className='text-[11px] font-bold text-gray-400 uppercase tracking-wider'>
											Payment Details
										</span>
									</div>
									<div className='space-y-0'>
										<InfoRow label='Payer' value={txn.payer} />
										<InfoRow label='Merchant' value={txn.merchant} />
										<InfoRow label='City' value={txn.city} />
										<InfoRow label='Issuer' value={txn.issuer} />
										<InfoRow label='Country' value={txn.country} />
										<InfoRow label='Currency' value={txn.currency} />
										<InfoRow
											label='Foreign Amount'
											value={txn.amount_foreign.toFixed(2)}
										/>
									</div>
								</div>

								{/* XAI Features */}
								<div className='bg-white/[0.02] rounded-xl p-4 border border-white/5'>
									<div className='flex items-center gap-2 mb-3'>
										<Activity size={14} className='text-purple-400' />
										<span className='text-[11px] font-bold text-gray-400 uppercase tracking-wider'>
											XAI Feature Importance
										</span>
									</div>
									{txn.xai_reasons && txn.xai_reasons.length > 0 ? (
										<div className='space-y-2'>
											{txn.xai_reasons
												.sort((a, b) => b.importance - a.importance)
												.map((f, i) => (
													<div key={i} className='flex items-center gap-2'>
														<div className='flex-1'>
															<div className='flex justify-between text-[11px] mb-1'>
																<span className='text-gray-300'>
																	{f.display_name}
																</span>
																<span className='text-gray-500'>
																	{(f.importance * 100).toFixed(0)}%
																</span>
															</div>
															<div className='h-1.5 bg-white/5 rounded-full overflow-hidden'>
																<div
																	className='h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500'
																	style={{
																		width: `${Math.min(f.importance * 100, 100)}%`,
																	}}
																/>
															</div>
														</div>
													</div>
												))}
										</div>
									) : (
										<p className='text-gray-600 text-xs italic'>
											No XAI features available
										</p>
									)}
								</div>
							</div>

							{/* Attack Detail */}
							{txn.attack_detail && (
								<div className='bg-red-500/5 rounded-xl p-4 border border-red-500/10'>
									<div className='flex items-center gap-2 mb-2'>
										<AlertTriangle size={14} className='text-red-400' />
										<span className='text-[11px] font-bold text-red-400 uppercase tracking-wider'>
											Attack Detail
										</span>
									</div>
									<p className='text-sm text-gray-300'>{txn.attack_detail}</p>
								</div>
							)}

							{/* Mini Transaction Graph */}
							<MiniGraphVisualizer transaction={txn} />

							{/* Review Status */}
							{txn.review_status && (
								<div className='bg-blue-500/5 rounded-xl p-3 border border-blue-500/10'>
									<p className='text-xs text-blue-400'>
										Review: <strong>{txn.review_status}</strong>
										{txn.review_note && <> — {txn.review_note}</>}
									</p>
								</div>
							)}

							{/* Investigate Button */}
							{txn.is_flagged && (
								<button
									onClick={() => onInvestigate(txn.txn_id)}
									className='w-full flex items-center justify-center gap-2.5 py-3 rounded-xl text-[13px] font-bold border transition-all bg-gradient-to-r from-orange-500/10 to-amber-500/10 text-orange-400 border-orange-500/30 hover:from-orange-500/20 hover:to-amber-500/20 hover:border-orange-500/50 cursor-pointer group'
								>
									<Sparkles size={16} className='group-hover:animate-pulse' />
									Investigate with AI
								</button>
							)}

							{/* Action Buttons */}
							<div className='flex gap-3 pt-2 pb-2'>
								<button
									onClick={() => onReview(txn.txn_id, 'confirmed_fraud')}
									disabled={txn.review_status === 'confirmed_fraud'}
									className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-bold border transition-all ${
										txn.review_status === 'confirmed_fraud'
											? 'bg-red-500/20 text-red-400 border-red-500/40 cursor-default'
											: isHighRisk
												? 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20 cursor-pointer ring-1 ring-red-500/30'
												: 'bg-red-500/5 text-red-400 border-red-500/20 hover:bg-red-500/15 cursor-pointer'
									}`}
								>
									<ShieldBan size={14} />
									Confirm Fraud
									{isHighRisk && txn.review_status !== 'confirmed_fraud' && (
										<span className='text-[9px] bg-red-500/30 px-1.5 py-0.5 rounded-md'>
											AI REC
										</span>
									)}
								</button>
								<button
									onClick={() => onReview(txn.txn_id, 'false_positive')}
									disabled={txn.review_status === 'false_positive'}
									className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-bold border transition-all ${
										txn.review_status === 'false_positive'
											? 'bg-green-500/20 text-green-400 border-green-500/40 cursor-default'
											: 'bg-green-500/5 text-green-400 border-green-500/20 hover:bg-green-500/15 cursor-pointer'
									}`}
								>
									<ShieldCheck size={14} />
									Clear (False Positive)
								</button>
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
};
