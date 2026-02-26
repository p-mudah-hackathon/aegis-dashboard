import React, { useRef, useLayoutEffect, useState } from 'react';
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

const TOOLTIP_OFFSET = 16;
const TOOLTIP_MARGIN = 12;

export const EdgeTooltip: React.FC<EdgeTooltipProps> = ({
	link,
	position,
	getNodeName,
}) => {
	const tooltipRef = useRef<HTMLDivElement>(null);
	const [adjustedPos, setAdjustedPos] = useState<{
		left: number;
		top: number;
	} | null>(null);

	const sourceName = getNodeName(link.source);
	const targetName = getNodeName(link.target);
	const accentColor = LINK_TYPE_ACCENTS[link.type] || '#6b7280';

	useLayoutEffect(() => {
		const el = tooltipRef.current;
		if (!el) return;

		const tooltipW = el.offsetWidth;
		const tooltipH = el.offsetHeight;

		// Get the container (parent with position: relative)
		const container = el.closest('.relative') as HTMLElement;
		const containerW = container?.clientWidth || window.innerWidth;
		const containerH = container?.clientHeight || window.innerHeight;

		// Default: place to the right of cursor
		let left = position.x + TOOLTIP_OFFSET;
		let top = position.y - tooltipH / 2;

		// Flip left if overflowing right edge
		if (left + tooltipW + TOOLTIP_MARGIN > containerW) {
			left = position.x - tooltipW - TOOLTIP_OFFSET;
		}

		// Clamp to bottom edge — push upward so card stays visible
		if (top + tooltipH + TOOLTIP_MARGIN > containerH) {
			top = containerH - tooltipH - TOOLTIP_MARGIN;
		}

		// Clamp to top edge
		if (top < TOOLTIP_MARGIN) {
			top = TOOLTIP_MARGIN;
		}

		// Clamp to left edge
		if (left < TOOLTIP_MARGIN) {
			left = TOOLTIP_MARGIN;
		}

		setAdjustedPos({ left, top });
	}, [position]);

	return (
		<div
			ref={tooltipRef}
			className='absolute pointer-events-none z-50'
			style={{
				top: adjustedPos?.top ?? -9999,
				left: adjustedPos?.left ?? -9999,
				visibility: adjustedPos ? 'visible' : 'hidden',
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
