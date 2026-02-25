import React from 'react';
import {
	X,
	ShieldCheck,
	Flag,
	ShieldBan,
	Smartphone,
	Store,
	Activity,
} from 'lucide-react';
import type { Transaction, TransactionStatus } from '../types';
import { TransactionFlowGraph } from './TransactionFlowGraph';

interface TransactionDetailModalProps {
	transaction: Transaction;
	onClose: () => void;
	onStatusChange: (txnId: string, status: TransactionStatus) => void;
}

function formatTimestamp(iso: string): string {
	const d = new Date(iso);
	return (
		d.toLocaleDateString('id-ID', {
			day: '2-digit',
			month: 'short',
			year: 'numeric',
		}) +
		', ' +
		d.toLocaleTimeString('id-ID', {
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
		})
	);
}

function getRiskColor(score: number): string {
	if (score >= 0.7) return 'text-red-400';
	if (score >= 0.4) return 'text-orange-400';
	return 'text-green-400';
}

function getRiskBg(score: number): string {
	if (score >= 0.7) return 'bg-red-500';
	if (score >= 0.4) return 'bg-orange-500';
	return 'bg-green-500';
}

const STATUS_STYLES: Record<TransactionStatus, string> = {
	PENDING: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
	APPROVED: 'bg-green-500/10 text-green-400 border-green-500/30',
	FLAGGED: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
	BLOCKED: 'bg-[#ff4d4d]/10 text-[#ff4d4d] border-[#ff4d4d]/30',
};

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

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
	transaction: txn,
	onClose,
	onStatusChange,
}) => {
	const isHighRisk = txn.merchantRiskScore >= 0.7;

	return (
		<div
			className='fixed inset-0 z-50 flex items-center justify-center p-4'
			onClick={onClose}
		>
			{/* Backdrop */}
			<div className='absolute inset-0 bg-black/60 backdrop-blur-sm' />

			{/* Modal */}
			<div
				className='relative bg-[#121212] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-[0_30px_80px_rgba(0,0,0,0.8)]'
				onClick={(e) => e.stopPropagation()}
			>
				{/* Header */}
				<div className='sticky top-0 bg-[#121212] border-b border-white/5 px-6 py-4 flex items-center justify-between z-10'>
					<div>
						<div className='flex items-center gap-3'>
							<h2 className='text-white font-bold text-lg font-mono'>
								{txn.txnId}
							</h2>
							<span
								className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-bold border ${STATUS_STYLES[txn.status]}`}
							>
								{txn.status}
							</span>
						</div>
						<p className='text-gray-500 text-xs mt-0.5'>
							{formatTimestamp(txn.timestamp)}
						</p>
					</div>
					<div className='flex items-center gap-3'>
						<span className='text-white font-bold text-lg'>
							IDR {txn.amountIdr.toLocaleString('id-ID')}
						</span>
						<button
							onClick={onClose}
							className='p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors'
						>
							<X size={18} />
						</button>
					</div>
				</div>

				<div className='px-6 py-4 space-y-4'>
					{/* User & Device */}
					<div className='bg-white/[0.02] rounded-xl p-4 border border-white/5'>
						<div className='flex items-center gap-2 mb-3'>
							<Smartphone size={14} className='text-blue-400' />
							<span className='text-[11px] font-bold text-gray-400 uppercase tracking-wider'>
								User & Device
							</span>
						</div>
						<div className='space-y-0'>
							<InfoRow label='User ID' value={txn.userId} />
							<InfoRow label='Device ID' value={txn.deviceId} />
							<InfoRow label='Device OS' value={txn.deviceOs} />
							<InfoRow label='IP Country' value={txn.ipCountry} />
							<InfoRow
								label='New Device'
								value={txn.isNewDevice ? '⚠ Yes' : 'No'}
								highlight={txn.isNewDevice}
							/>
							<InfoRow
								label='Shared Device (24h)'
								value={txn.sharedDevice24h ? '⚠ Yes' : 'No'}
								highlight={txn.sharedDevice24h}
							/>
						</div>
					</div>

					{/* Merchant & Issuer */}
					<div className='bg-white/[0.02] rounded-xl p-4 border border-white/5'>
						<div className='flex items-center gap-2 mb-3'>
							<Store size={14} className='text-amber-400' />
							<span className='text-[11px] font-bold text-gray-400 uppercase tracking-wider'>
								Merchant & Issuer
							</span>
						</div>
						<div className='space-y-0'>
							<InfoRow label='Merchant ID' value={txn.merchantId} />
							<InfoRow label='Merchant City' value={txn.merchantCity} />
							<InfoRow label='MCC' value={txn.merchantMcc} />
							<InfoRow label='Issuer ID' value={txn.issuerId} />
							<InfoRow label='Issuer Country' value={txn.issuerCountry} />
							{/* Risk Score Bar */}
							<div className='flex justify-between items-center py-1.5'>
								<span className='text-[11px] text-gray-500'>
									Merchant Risk Score
								</span>
								<div className='flex items-center gap-2'>
									<div className='w-20 h-1.5 bg-white/5 rounded-full overflow-hidden'>
										<div
											className={`h-full rounded-full ${getRiskBg(txn.merchantRiskScore)}`}
											style={{
												width: `${Math.min(txn.merchantRiskScore * 100, 100)}%`,
											}}
										/>
									</div>
									<span
										className={`text-[12px] font-bold ${getRiskColor(txn.merchantRiskScore)}`}
									>
										{(txn.merchantRiskScore * 100).toFixed(1)}%
									</span>
								</div>
							</div>
						</div>
					</div>

					{/* Risk Signals */}
					<div className='bg-white/[0.02] rounded-xl p-4 border border-white/5'>
						<div className='flex items-center gap-2 mb-3'>
							<Activity size={14} className='text-purple-400' />
							<span className='text-[11px] font-bold text-gray-400 uppercase tracking-wider'>
								Risk Signals
							</span>
						</div>
						<div className='space-y-0'>
							<InfoRow
								label='Avg Amount (7d)'
								value={`IDR ${txn.userAvgAmount7d.toLocaleString('id-ID')}`}
							/>
							<InfoRow
								label='Txn Count (24h)'
								value={txn.userTxnCount24h}
								highlight={txn.userTxnCount24h >= 5}
							/>
							<InfoRow
								label='Velocity (10m)'
								value={txn.txnVelocity10m}
								highlight={txn.txnVelocity10m >= 2}
							/>
							<InfoRow
								label='Time Since Last Txn'
								value={
									txn.timeSinceLastTxnSec >= 99999
										? '—'
										: `${txn.timeSinceLastTxnSec.toLocaleString()}s`
								}
								highlight={
									txn.timeSinceLastTxnSec < 120 &&
									txn.timeSinceLastTxnSec < 99999
								}
							/>
							<InfoRow
								label='Country Switch (24h)'
								value={txn.countrySwitch24h}
								highlight={txn.countrySwitch24h >= 2}
							/>
						</div>
					</div>

					{/* Fund Flow Graph */}
					<TransactionFlowGraph transaction={txn} />

					{/* Action Buttons */}
					<div className='flex gap-3 pt-2'>
						<button
							onClick={() => onStatusChange(txn.txnId, 'APPROVED')}
							disabled={txn.status === 'APPROVED'}
							className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-bold border transition-all ${
								txn.status === 'APPROVED'
									? 'bg-green-500/20 text-green-400 border-green-500/40 cursor-default'
									: 'bg-green-500/5 text-green-400 border-green-500/20 hover:bg-green-500/15 cursor-pointer'
							}`}
						>
							<ShieldCheck size={14} />
							Approve
						</button>
						<button
							onClick={() => onStatusChange(txn.txnId, 'FLAGGED')}
							disabled={txn.status === 'FLAGGED'}
							className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-bold border transition-all ${
								txn.status === 'FLAGGED'
									? 'bg-orange-500/20 text-orange-400 border-orange-500/40 cursor-default'
									: 'bg-orange-500/5 text-orange-400 border-orange-500/20 hover:bg-orange-500/15 cursor-pointer'
							}`}
						>
							<Flag size={14} />
							Flag
						</button>
						<button
							onClick={() => onStatusChange(txn.txnId, 'BLOCKED')}
							disabled={txn.status === 'BLOCKED'}
							className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-bold border transition-all ${
								txn.status === 'BLOCKED'
									? 'bg-red-500/20 text-red-400 border-red-500/40 cursor-default'
									: isHighRisk
										? 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20 cursor-pointer ring-1 ring-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.15)]'
										: 'bg-red-500/5 text-red-400 border-red-500/20 hover:bg-red-500/15 cursor-pointer'
							}`}
						>
							<ShieldBan size={14} />
							Block
							{isHighRisk && txn.status !== 'BLOCKED' && (
								<span className='text-[9px] bg-red-500/30 px-1.5 py-0.5 rounded-md'>
									AI REC
								</span>
							)}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};
