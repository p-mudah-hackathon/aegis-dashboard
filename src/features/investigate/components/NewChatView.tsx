import React from 'react';
import { MessageSquare } from 'lucide-react';
import type { Transaction } from '../types';

interface NewChatViewProps {
	txnIdInput: string;
	onTxnIdChange: (value: string) => void;
	onStartChat: (txnId: string) => void;
	recentTxns: Transaction[];
}

export const NewChatView: React.FC<NewChatViewProps> = ({
	txnIdInput,
	onTxnIdChange,
	onStartChat,
	recentTxns,
}) => {
	return (
		<div
			className='flex-1 flex flex-col overflow-hidden transition-colors duration-300'
			style={{
				background:
					'radial-gradient(circle at 30% 20%, var(--primary-muted, rgba(249,115,22,0.03)) 0%, transparent 50%), var(--background)',
			}}
		>
			{/* Sticky: title + input + section heading */}
			<div className='shrink-0 px-8 pt-10 pb-0'>
				<div className='max-w-2xl mx-auto'>
					<h2 className='text-text-primary text-2xl font-bold mb-2'>
						Start a New Investigation
					</h2>
					<p className='text-text-muted mb-6'>
						Select a flagged transaction or enter a Transaction ID to
						investigate with AI
					</p>

					<div className='flex gap-3 mb-6'>
						<input
							type='text'
							value={txnIdInput}
							onChange={(e) => onTxnIdChange(e.target.value)}
							placeholder='Enter Transaction ID (e.g. TXN-000042)'
							className='flex-1 bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-placeholder focus:outline-none focus:border-primary/50 transition-colors'
							onKeyDown={(e) => e.key === 'Enter' && onStartChat(txnIdInput)}
						/>
						<button
							onClick={() => onStartChat(txnIdInput)}
							disabled={!txnIdInput.trim()}
							className='px-6 py-3 bg-linear-to-r from-orange-500 to-amber-500 rounded-xl text-sm font-bold text-white hover:shadow-lg hover:shadow-orange-500/20 transition-all disabled:opacity-30'
						>
							Investigate
						</button>
					</div>

					{recentTxns.length > 0 && (
						<div className='pb-4 border-b border-border'>
							<h3 className='text-text-muted text-xs font-bold uppercase tracking-wider'>
								⚠ Flagged Transactions — Click to Investigate
							</h3>
						</div>
					)}
				</div>
			</div>

			{/* Scrollable transaction list with custom scrollbar */}
			<div className='flex-1 overflow-y-auto px-8 pt-4 pb-8 custom-scrollbar'>
				<div className='max-w-2xl mx-auto'>
					{recentTxns.length > 0 && (
						<div className='grid grid-cols-1 gap-3'>
							{recentTxns.map((txn) => (
								<button
									key={txn.txn_id}
									onClick={() => {
										onTxnIdChange(txn.txn_id);
										onStartChat(txn.txn_id);
									}}
									className='flex items-center gap-4 p-4 bg-surface-2 border border-border rounded-xl hover:border-primary/30 hover:bg-primary/5 transition-all text-left group'
								>
									<div
										className={`bg-surface-2 rounded-lg px-2 py-1 ${txn.risk_score >= 0.7 ? 'text-danger' : 'text-primary'}`}
									>
										{(txn.risk_score * 100).toFixed(0)}%
									</div>
									<div className='flex-1'>
										<p className='text-sm font-mono text-text-secondary'>
											{txn.txn_id}
										</p>
										<p className='text-xs text-text-muted'>
											{txn.merchant} · {txn.city} · IDR{' '}
											{txn.amount_idr.toLocaleString('id-ID')}
											{txn.fraud_type && (() => {
												const fraudTextColor: Record<string, string> = {
													velocity_attack: 'text-purple',
													card_testing: 'text-cyan',
													collusion_ring: 'text-pink',
													geo_anomaly: 'text-warning',
													amount_anomaly: 'text-danger',
												};
												return (
													<span className={`${fraudTextColor[txn.fraud_type] || 'text-muted-foreground'} ml-2`}>
														({txn.fraud_type.replace(/_/g, ' ')})
													</span>
												);
											})()}
										</p>
									</div>
									<MessageSquare
										size={16}
										className='text-text-faint group-hover:text-primary transition-colors'
									/>
								</button>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};
