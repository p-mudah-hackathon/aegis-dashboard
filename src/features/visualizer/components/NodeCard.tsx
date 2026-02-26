import React, {
	useRef,
	useLayoutEffect,
	useState,
	useCallback,
	useEffect,
} from 'react';
import { ShieldAlert, X, GripVertical } from 'lucide-react';
import type { GraphNode } from '../types';
import { NODE_ICONS } from '../constants';

interface NodeCardProps {
	node: GraphNode;
	connectionCount: number;
	position: { x: number; y: number };
	containerSize: { width: number; height: number };
	onClose: () => void;
	onInvestigate: (id: string) => void;
}

const CARD_OFFSET = 20;
const CARD_MARGIN = 12;

export const NodeCard: React.FC<NodeCardProps> = ({
	node,
	connectionCount,
	position,
	containerSize,
	onClose,
	onInvestigate,
}) => {
	const cardRef = useRef<HTMLDivElement>(null);
	const [cardPos, setCardPos] = useState<{ left: number; top: number } | null>(
		null,
	);
	const [isDragging, setIsDragging] = useState(false);
	const dragOffset = useRef({ x: 0, y: 0 });

	// Calculate initial clamped position
	useLayoutEffect(() => {
		const el = cardRef.current;
		if (!el) return;

		const cardW = el.offsetWidth;
		const cardH = el.offsetHeight;
		const container = el.closest('.relative') as HTMLElement;
		const cW = container?.clientWidth || containerSize.width;
		const cH = container?.clientHeight || containerSize.height;

		let left = position.x + CARD_OFFSET;
		let top = position.y - CARD_OFFSET;

		if (left + cardW + CARD_MARGIN > cW)
			left = position.x - cardW - CARD_OFFSET;
		if (top + cardH + CARD_MARGIN > cH) top = cH - cardH - CARD_MARGIN;
		if (top < CARD_MARGIN) top = CARD_MARGIN;
		if (left < CARD_MARGIN) left = CARD_MARGIN;

		setCardPos({ left, top });
	}, [position, containerSize]);

	// Drag handlers
	const handleDragStart = useCallback(
		(e: React.MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();
			if (!cardPos) return;
			setIsDragging(true);
			const container = cardRef.current?.closest('.relative') as HTMLElement;
			const rect = container?.getBoundingClientRect();
			if (rect) {
				dragOffset.current = {
					x: e.clientX - rect.left - cardPos.left,
					y: e.clientY - rect.top - cardPos.top,
				};
			}
		},
		[cardPos],
	);

	useEffect(() => {
		if (!isDragging) return;

		const handleMove = (e: MouseEvent) => {
			const container = cardRef.current?.closest('.relative') as HTMLElement;
			const rect = container?.getBoundingClientRect();
			if (!rect) return;

			const relX = e.clientX - rect.left;
			const relY = e.clientY - rect.top;

			setCardPos({
				left: relX - dragOffset.current.x,
				top: relY - dragOffset.current.y,
			});
		};

		const handleUp = () => setIsDragging(false);

		window.addEventListener('mousemove', handleMove);
		window.addEventListener('mouseup', handleUp);
		return () => {
			window.removeEventListener('mousemove', handleMove);
			window.removeEventListener('mouseup', handleUp);
		};
	}, [isDragging]);

	const borderColor =
		node.riskScore && node.riskScore > 85
			? 'border-red-500/30'
			: node.riskScore && node.riskScore > 70
				? 'border-orange-500/30'
				: 'border-white/10';

	return (
		<div
			ref={cardRef}
			className='absolute z-40'
			style={{
				left: cardPos?.left ?? -9999,
				top: cardPos?.top ?? -9999,
				visibility: cardPos ? 'visible' : 'hidden',
				transition: isDragging ? 'none' : 'opacity 0.2s ease',
			}}
			onClick={(e) => e.stopPropagation()}
		>
			<div
				className={`bg-[#121212]/95 backdrop-blur-xl ${borderColor} border rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] min-w-[260px] overflow-hidden`}
			>
				{/* Drag handle header */}
				<div
					className='flex items-center justify-between px-5 pt-4 pb-3 select-none'
					style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
					onMouseDown={handleDragStart}
				>
					<div className='flex items-center gap-3'>
						<div className='size-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-lg'>
							{NODE_ICONS[node.type] || '○'}
						</div>
						<div>
							<div className='text-white font-bold text-[13px] leading-tight'>
								{node.name}
							</div>
							<div className='text-gray-500 text-[10px] font-mono mt-0.5'>
								{node.id}
							</div>
						</div>
					</div>
					<div className='flex items-center gap-1'>
						<GripVertical size={14} className='text-gray-600' />
						<button
							onClick={onClose}
							className='p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors'
						>
							<X size={14} />
						</button>
					</div>
				</div>

				<div className='h-px bg-white/5' />

				{/* Details */}
				<div className='px-5 py-3 space-y-2.5'>
					<div className='flex justify-between items-center'>
						<span className='text-gray-500 text-[11px]'>Type</span>
						<span className='text-white text-[11px] font-medium bg-white/5 px-2.5 py-1 rounded-lg'>
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
									{node.riskScore}%
								</span>
							</div>
							<div className='w-full bg-white/5 rounded-full h-1.5'>
								<div
									className={`h-1.5 rounded-full transition-all duration-500 ${
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

				{/* Investigate button */}
				{node.riskScore && node.riskScore > 70 && (
					<>
						<div className='h-px bg-white/5' />
						<div className='px-5 py-3'>
							<button
								onClick={() => onInvestigate(node.id)}
								className='w-full py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[11px] font-semibold hover:bg-red-500/20 transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(239,68,68,0.1)]'
							>
								<ShieldAlert size={12} />
								Investigate Entity
							</button>
						</div>
					</>
				)}
			</div>
		</div>
	);
};
