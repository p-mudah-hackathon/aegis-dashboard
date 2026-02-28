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
			className='flex-1 flex flex-col overflow-hidden'
			style={{
				background:
					'radial-gradient(circle at 30% 20%, rgba(249,115,22,0.03) 0%, transparent 50%), #0a0a0a',
			}}
		>
			{/* Sticky: title + input + section heading */}
			<div className='shrink-0 px-8 pt-10 pb-0'>
				<div className='max-w-2xl mx-auto'>
					<h2 className='text-white text-2xl font-bold mb-2'>
						Start a New Investigation
					</h2>
					<p className='text-gray-500 mb-6'>
						Select a flagged transaction or enter a Transaction ID to
						investigate with AI
					</p>

					<div className='flex gap-3 mb-6'>
						<input
							type='text'
							value={txnIdInput}
							onChange={(e) => onTxnIdChange(e.target.value)}
							placeholder='Enter Transaction ID (e.g. TXN-000042)'
							className='flex-1 bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50'
							onKeyDown={(e) => e.key === 'Enter' && onStartChat(txnIdInput)}
						/>
						<button
							onClick={() => onStartChat(txnIdInput)}
							disabled={!txnIdInput.trim()}
							className='px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl text-sm font-bold text-white hover:shadow-lg hover:shadow-orange-500/20 transition-all disabled:opacity-30'
						>
							Investigate
						</button>
					</div>

					{recentTxns.length > 0 && (
						<div className='pb-4 border-b border-white/5'>
							<h3 className='text-gray-400 text-xs font-bold uppercase tracking-wider'>
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
									className='flex items-center gap-4 p-4 bg-[#1a1a1a] border border-white/5 rounded-xl hover:border-orange-500/30 hover:bg-orange-500/5 transition-all text-left group'
								>
									<div
										className={`text-lg font-bold ${txn.risk_score >= 0.7 ? 'text-red-400' : 'text-orange-400'}`}
									>
										{(txn.risk_score * 100).toFixed(0)}%
									</div>
									<div className='flex-1'>
										<p className='text-sm font-mono text-gray-300'>
											{txn.txn_id}
										</p>
										<p className='text-xs text-gray-500'>
											{txn.merchant} · {txn.city} · IDR{' '}
											{txn.amount_idr.toLocaleString('id-ID')}
											{txn.fraud_type && (
												<span className='text-purple-400 ml-2'>
													({txn.fraud_type.replace(/_/g, ' ')})
												</span>
											)}
										</p>
									</div>
									<MessageSquare
										size={16}
										className='text-gray-600 group-hover:text-orange-400 transition-colors'
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
