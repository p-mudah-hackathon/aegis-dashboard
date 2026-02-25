import React, { useRef, useLayoutEffect, useState } from 'react';
import { ShieldAlert, X } from 'lucide-react';
import type { GraphNode } from '../types';
import { NODE_ICONS } from '../constants';

interface NodeCardProps {
	node: GraphNode;
	connectionCount: number;
	position: { x: number; y: number };
	containerSize: { width: number; height: number };
	onClose: () => void;
}

const CARD_OFFSET = 20;
const CARD_MARGIN = 12;

export const NodeCard: React.FC<NodeCardProps> = ({
	node,
	connectionCount,
	position,
	containerSize,
	onClose,
}) => {
	const cardRef = useRef<HTMLDivElement>(null);
	const [adjustedPos, setAdjustedPos] = useState({ left: 0, top: 0 });

	useLayoutEffect(() => {
		const el = cardRef.current;
		if (!el) return;

		const cardW = el.offsetWidth;
		const cardH = el.offsetHeight;

		// Default: place card to the right and slightly above the click
		let left = position.x + CARD_OFFSET;
		let top = position.y - CARD_OFFSET;

		// Flip left if overflowing right edge
		if (left + cardW + CARD_MARGIN > containerSize.width) {
			left = position.x - cardW - CARD_OFFSET;
		}

		// Flip up if overflowing bottom edge
		if (top + cardH + CARD_MARGIN > containerSize.height) {
			top = containerSize.height - cardH - CARD_MARGIN;
		}

		// Clamp to top edge
		if (top < CARD_MARGIN) {
			top = CARD_MARGIN;
		}

		// Clamp to left edge
		if (left < CARD_MARGIN) {
			left = CARD_MARGIN;
		}

		setAdjustedPos({ left, top });
	}, [position, containerSize]);

	return (
		<div
			ref={cardRef}
			className='absolute z-40'
			style={{
				left: adjustedPos.left,
				top: adjustedPos.top,
			}}
		>
			<div className='bg-[#121212] border border-white/10 rounded-2xl p-5 min-w-[250px] shadow-[0_20px_60px_rgba(0,0,0,0.6)]'>
				{/* Header */}
				<div className='flex items-center justify-between mb-4'>
					<div className='flex items-center gap-3'>
						<div className='size-9 rounded-xl bg-white/5 flex items-center justify-center text-base'>
							{NODE_ICONS[node.type] || '○'}
						</div>
						<div>
							<div className='text-white font-bold text-[13px]'>
								{node.name}
							</div>
							<div className='text-gray-500 text-[10px] font-mono'>
								{node.id}
							</div>
						</div>
					</div>
					<button
						onClick={onClose}
						className='p-1 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors'
					>
						<X size={14} />
					</button>
				</div>

				{/* Details */}
				<div className='space-y-2.5'>
					<div className='flex justify-between items-center'>
						<span className='text-gray-500 text-[11px]'>Type</span>
						<span className='text-white text-[11px] font-medium bg-white/5 px-2 py-0.5 rounded-md'>
							{node.type}
						</span>
					</div>
					<div className='flex justify-between items-center'>
						<span className='text-gray-500 text-[11px]'>Connections</span>
						<span className='text-white text-[11px] font-semibold'>
							{connectionCount}
						</span>
					</div>
					{node.riskScore !== undefined && node.riskScore > 0 && (
						<>
							<div className='flex justify-between items-center'>
								<span className='text-gray-500 text-[11px]'>Risk Score</span>
								<span
									className={`text-sm font-bold ${
										node.riskScore > 85
											? 'text-red-400'
											: node.riskScore > 70
												? 'text-orange-400'
												: 'text-green-400'
									}`}
								>
									{node.riskScore} / 100
								</span>
							</div>
							<div className='w-full bg-white/5 rounded-full h-1.5'>
								<div
									className={`h-1.5 rounded-full ${
										node.riskScore > 85
											? 'bg-red-500'
											: node.riskScore > 70
												? 'bg-orange-500'
												: 'bg-green-500'
									}`}
									style={{ width: `${node.riskScore}%` }}
								/>
							</div>
						</>
					)}
				</div>

				{/* Investigate button for high risk */}
				{node.riskScore && node.riskScore > 70 && (
					<button className='mt-4 w-full py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[11px] font-semibold hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2'>
						<ShieldAlert size={12} />
						Investigate Entity
					</button>
				)}
			</div>
		</div>
	);
};
