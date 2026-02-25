import React from 'react';
import type { GraphLink } from '../types';

interface EdgeTooltipProps {
	link: GraphLink;
	position: { x: number; y: number };
	getNodeName: (endpoint: any) => string;
}

const LINK_TYPE_LABELS: Record<string, string> = {
	PAYMENT: '💳 Payment',
	OWNERSHIP: '🔗 Ownership',
	LOCATION: '📍 Location',
};

const LINK_TYPE_ACCENTS: Record<string, string> = {
	PAYMENT: '#f97316',
	OWNERSHIP: '#3b82f6',
	LOCATION: '#8b5cf6',
};

export const EdgeTooltip: React.FC<EdgeTooltipProps> = ({
	link,
	position,
	getNodeName,
}) => {
	const sourceName = getNodeName(link.source);
	const targetName = getNodeName(link.target);
	const accentColor = LINK_TYPE_ACCENTS[link.type] || '#6b7280';

	return (
		<div
			className='absolute pointer-events-none z-50'
			style={{
				top: position.y,
				left: position.x,
				transform: 'translate(16px, -50%)',
			}}
		>
			<div className='bg-[#1a1a1a] rounded-xl shadow-2xl border border-white/10 overflow-hidden min-w-[220px]'>
				{/* Header — tipe koneksi */}
				<div
					className='px-4 py-2.5 border-b border-white/5'
					style={{ borderTopColor: accentColor, borderTopWidth: 2 }}
				>
					<span className='text-[10px] font-bold uppercase tracking-wider text-gray-400'>
						{LINK_TYPE_LABELS[link.type] || link.type}
					</span>
				</div>

				{/* Body */}
				<div className='px-4 py-3 space-y-2'>
					{/* Pengirim */}
					<div className='flex justify-between items-center gap-4'>
						<span className='text-[11px] text-gray-500'>Pengirim</span>
						<span className='text-[12px] font-semibold text-white'>
							{sourceName}
						</span>
					</div>

					{/* Penerima */}
					<div className='flex justify-between items-center gap-4'>
						<span className='text-[11px] text-gray-500'>Penerima</span>
						<span className='text-[12px] font-semibold text-white'>
							{targetName}
						</span>
					</div>

					{/* Nilai Transaksi */}
					{link.amount && (
						<div className='flex justify-between items-center gap-4'>
							<span className='text-[11px] text-gray-500'>Nilai Transaksi</span>
							<span
								className='text-[12px] font-bold'
								style={{ color: accentColor }}
							>
								IDR {link.amount.toLocaleString('id-ID')}
							</span>
						</div>
					)}

					{/* Waktu */}
					<div className='flex justify-between items-center gap-4 pt-1 border-t border-white/5'>
						<span className='text-[11px] text-gray-500'>Waktu</span>
						<span className='text-[11px] text-gray-300'>{link.time}</span>
					</div>
				</div>
			</div>
		</div>
	);
};
