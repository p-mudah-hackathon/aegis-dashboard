import React, { useState, useEffect } from 'react';
import {
	X,
	ShieldBan,
	ShieldCheck,
	AlertTriangle,
	Store,
	ShieldAlert,
	Activity,
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
	if (score >= 0.7) return 'text-danger';
	if (score >= 0.3) return 'text-primary';
	return 'text-success';
}

const InfoRow: React.FC<{
	label: string;
	value: string | number;
	highlight?: boolean;
}> = ({ label, value, highlight }) => (
	<div className='flex justify-between items-center py-1.5'>
		<span className='text-[11px] text-text-faint'>{label}</span>
		<span
			className={`text-[12px] font-medium ${highlight ? 'text-primary' : 'text-text-secondary'}`}
		>
			{value}
		</span>
	</div>
);

const SkeletonBlock: React.FC<{ className?: string }> = ({
	className = '',
}) => (
	<div
		className={`animate-pulse bg-skeleton-shimmer rounded-lg ${className}`}
	/>
);

const ModalSkeleton: React.FC = () => (
	<div className='space-y-4'>
		<div className='flex items-center gap-4 p-4 bg-muted/20 rounded-xl border border-border'>
			<SkeletonBlock className='w-20 h-10 rounded-xl' />
			<div className='space-y-2 flex-1'>
				<SkeletonBlock className='w-28 h-3' />
				<SkeletonBlock className='w-20 h-4' />
			</div>
		</div>
		<div className='grid grid-cols-2 gap-4'>
			<div className='bg-muted/20 rounded-xl p-4 border border-border space-y-3'>
				<SkeletonBlock className='w-24 h-3' />
				{[...Array(5)].map((_, i) => (
					<div key={i} className='flex justify-between'>
						<SkeletonBlock className='w-14 h-2.5' />
						<SkeletonBlock className='w-20 h-2.5' />
					</div>
				))}
			</div>
			<div className='bg-muted/20 rounded-xl p-4 border border-border space-y-3'>
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
		<div className='bg-muted/20 rounded-xl border border-border overflow-hidden'>
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

	const [showContent, setShowContent] = useState(false);
	useEffect(() => {
		const timer = setTimeout(() => setShowContent(true), 350);
		return () => clearTimeout(timer);
	}, [txn.txn_id]);

	const isReviewed =
		txn.review_status === 'confirmed_fraud' ||
		txn.review_status === 'false_positive';

	return (
		<div
			className='fixed inset-0 z-50 flex items-center justify-center p-4'
			onClick={onClose}
		>
			<div className='absolute inset-0 bg-overlay backdrop-blur-sm' />
			<div
				className='relative bg-card border border-border rounded-2xl w-full max-w-[800px] max-h-[85vh] shadow-[0_30px_80px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200'
				onClick={(e) => e.stopPropagation()}
			>
				<div className='shrink-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between'>
					<div>
						<div className='flex items-center gap-3'>
							<h2 className='text-foreground font-bold text-lg font-mono'>
								{txn.txn_id}
							</h2>
							{txn.is_flagged && (
								<span className='inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-bold border bg-primary/10 text-primary border-primary/30'>
									⚠ FLAGGED
								</span>
							)}
							{txn.is_fraud && (
								<span className='inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-bold border bg-danger-muted text-danger border-danger/30'>
									FRAUD
								</span>
							)}
						</div>
						<p className='text-muted-foreground text-xs mt-0.5'>
							{txn.timestamp}
						</p>
					</div>
					<div className='flex items-center gap-3'>
						<span className='text-foreground font-bold text-lg'>
							IDR {txn.amount_idr.toLocaleString('id-ID')}
						</span>
						<button
							onClick={onClose}
							className='p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors'
						>
							<X size={18} />
						</button>
					</div>
				</div>
				<div
					className='flex-1 overflow-y-auto px-6 py-4 space-y-4 custom-scrollbar'
				>
					{!showContent ? (
						<ModalSkeleton />
					) : (
						<>
							<div className='flex items-center gap-4 p-4 bg-muted/20 rounded-xl border border-border'>
								<div
									className={`text-3xl font-bold ${getRiskColor(txn.risk_score)}`}
								>
									{(txn.risk_score * 100).toFixed(1)}%
								</div>
								<div>
									<p className='text-xs text-muted-foreground'>
										HTGNN Risk Score
									</p>
									<p
										className={`text-sm font-bold ${getRiskColor(txn.risk_score)}`}
									>
										{txn.risk_score >= 0.7
											? 'HIGH RISK'
											: txn.risk_score >= 0.3
												? 'MEDIUM RISK'
												: 'LOW RISK'}
									</p>
								</div>
								{txn.fraud_type && (() => {
									const fraudColorMap = {
										velocity_attack: { bg: 'bg-purple-muted', text: 'text-purple', border: 'border-purple/20', label: 'text-purple/60' },
										card_testing: { bg: 'bg-info-muted', text: 'text-cyan', border: 'border-cyan/20', label: 'text-cyan/60' },
										collusion_ring: { bg: 'bg-pink/10', text: 'text-pink', border: 'border-pink/20', label: 'text-pink/60' },
										geo_anomaly: { bg: 'bg-warning-muted', text: 'text-warning', border: 'border-warning/20', label: 'text-warning/60' },
										amount_anomaly: { bg: 'bg-danger-muted', text: 'text-danger', border: 'border-danger/20', label: 'text-danger/60' },
									};
									const colors = fraudColorMap[txn.fraud_type as keyof typeof fraudColorMap] || { bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-border', label: 'text-muted-foreground/60' };
									return (
										<div className={`ml-auto px-3 py-1.5 ${colors.bg} rounded-lg border ${colors.border}`}>
											<p className={`text-[10px] ${colors.label} uppercase tracking-wider`}>
												Fraud Type
											</p>
											<p className={`text-sm font-bold ${colors.text}`}>
												{txn.fraud_type
													.replace(/_/g, ' ')
													.replace(/\b\w/g, (c) => c.toUpperCase())}
											</p>
										</div>
									);
								})()}
							</div>

							<div className='grid grid-cols-2 gap-4'>
								<div className='bg-muted/20 rounded-xl p-4 border border-border'>
									<div className='flex items-center gap-2 mb-3'>
										<Store size={14} className='text-warning' />
										<span className='text-[11px] font-bold text-muted-foreground uppercase tracking-wider'>
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

								<div className='bg-muted/20 rounded-xl p-4 border border-border'>
									<div className='flex items-center gap-2 mb-3'>
										<Activity size={14} className='text-purple' />
										<span className='text-[11px] font-bold text-muted-foreground uppercase tracking-wider'>
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
																<span className='text-foreground'>
																	{f.display_name}
																</span>
																<span className='text-muted-foreground'>
																	{(f.importance * 100).toFixed(0)}%
																</span>
															</div>
															<div className='h-1.5 bg-muted rounded-full overflow-hidden'>
																<div
																	className='h-full rounded-full bg-linear-to-r from-primary to-danger'
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
										<p className='text-text-placeholder text-xs italic'>
											No XAI features available
										</p>
									)}
								</div>
							</div>
							{txn.attack_detail && (
								<div className='bg-danger-muted rounded-xl p-4 border border-danger/10'>
									<div className='flex items-center gap-2 mb-2'>
										<AlertTriangle size={14} className='text-danger' />
										<span className='text-[11px] font-bold text-danger uppercase tracking-wider'>
											Attack Detail
										</span>
									</div>
									<p className='text-sm text-foreground'>{txn.attack_detail}</p>
								</div>
							)}

							<MiniGraphVisualizer transaction={txn} />

							{txn.review_status && (
								<div className='bg-primary/5 rounded-xl p-3 border border-primary/10'>
									<p className='text-xs text-primary'>
										Review: <strong>{txn.review_status}</strong>
										{txn.review_note && <> — {txn.review_note}</>}
									</p>
								</div>
							)}

							{/* Investigate Button */}
							{txn.is_flagged && (
								<button
									onClick={() => onInvestigate(txn.txn_id)}
									className='w-full flex items-center justify-center gap-2.5 py-3 rounded-xl text-[13px] font-bold border transition-all bg-primary/10 text-primary border-primary/30 hover:bg-primary/20 hover:border-primary/50 cursor-pointer group'
								>
									<ShieldAlert size={14} />
									Investigate Entity
								</button>
							)}

							{/* Action Buttons */}
							<div className='flex gap-3 pt-2 pb-2'>
								<div
									onClick={() =>
										onReview &&
										!isReviewed &&
										onReview(txn.txn_id, 'confirmed_fraud')
									}
									className={`w-full py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2
										${
											txn.review_status === 'confirmed_fraud'
												? 'bg-danger-muted text-danger border-danger/40 cursor-default'
												: isReviewed
													? 'opacity-50 grayscale cursor-not-allowed'
													: 'bg-danger-muted text-danger border-danger/20 hover:bg-danger/10 cursor-pointer'
										}`}
								>
									<ShieldBan size={14} />
									Confirm Fraud
									{isHighRisk && txn.review_status !== 'confirmed_fraud' && (
										<span className='text-[9px] bg-danger/30 px-1.5 py-0.5 rounded-md'>
											AI REC
										</span>
									)}
								</div>
								<div
									onClick={() =>
										onReview &&
										!isReviewed &&
										onReview(txn.txn_id, 'false_positive')
									}
									className={`w-full py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2
										${
											txn.review_status === 'false_positive'
												? 'bg-success-muted text-success border-success/40 cursor-default'
												: isReviewed
													? 'opacity-50 grayscale cursor-not-allowed'
													: 'bg-success-muted text-success border-success/20 hover:bg-success/10 cursor-pointer'
										}`}
								>
									<ShieldCheck size={14} />
									Clear (False Positive)
								</div>
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
};
