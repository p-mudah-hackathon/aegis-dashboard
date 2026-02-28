import React, { useRef, useMemo, useEffect, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { GitBranchPlus } from 'lucide-react';
import type { Transaction } from '../../../api';
import {
	buildGraphFromTransactions,
	NODE_ICONS,
	LINK_TYPE_COLORS,
} from '../../visualizer/constants';

interface MiniGraphVisualizerProps {
	transaction: Transaction;
}

const LEGEND_ITEMS = [
	{ icon: '👤', label: 'Payer', color: '#3b82f6' },
	{ icon: '💳', label: 'Transaction', color: '#6b7280' },
	{ icon: '🏪', label: 'Merchant', color: '#f59e0b' },
	{ icon: '🏦', label: 'Issuer', color: '#10b981' },
	{ icon: '📱', label: 'Country', color: '#8b5cf6' },
];

const LINK_LEGEND = [
	{ label: 'Payment', color: 'rgba(249, 115, 22, 0.6)' },
	{ label: 'Ownership', color: 'rgba(59, 130, 246, 0.6)' },
	{ label: 'Location', color: 'rgba(139, 92, 246, 0.6)' },
];

export const MiniGraphVisualizer: React.FC<MiniGraphVisualizerProps> = ({
	transaction,
}) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const graphRef = useRef<any>(null);

	const graphData = useMemo(() => {
		return buildGraphFromTransactions([transaction]);
	}, [transaction]);

	// Configure forces after graph mounts
	useEffect(() => {
		if (graphRef.current) {
			graphRef.current.d3Force('charge')?.strength(-200);
			graphRef.current.d3Force('link')?.distance(60);
			// Zoom to fit after initial settle
			setTimeout(() => {
				graphRef.current?.zoomToFit(400, 40);
			}, 500);
		}
	}, [graphData]);

	const paintNode = useCallback(
		(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
			const { x, y, type, riskScore } = node;
			const radius = Math.sqrt((node.val as number) || 72) * 1.4;

			// Border color by type
			const borderColor =
				type === 'TRANSACTION'
					? riskScore && riskScore > 70
						? '#ef4444'
						: '#6b7280'
					: type === 'USER'
						? '#3b82f6'
						: type === 'MERCHANT'
							? '#f59e0b'
							: type === 'ISSUER'
								? '#10b981'
								: '#8b5cf6';

			// Glow for high risk
			if (riskScore && riskScore > 70) {
				ctx.beginPath();
				ctx.arc(x, y, radius + 4, 0, 2 * Math.PI);
				const grad = ctx.createRadialGradient(x, y, radius, x, y, radius + 4);
				grad.addColorStop(0, 'rgba(239, 68, 68, 0.3)');
				grad.addColorStop(1, 'rgba(239, 68, 68, 0)');
				ctx.fillStyle = grad;
				ctx.fill();
			}

			// Main circle
			ctx.beginPath();
			ctx.arc(x, y, radius, 0, 2 * Math.PI);
			ctx.fillStyle = '#1a1a1a';
			ctx.fill();
			ctx.strokeStyle = `${borderColor}bb`;
			ctx.lineWidth = 1.5;
			ctx.stroke();

			// Icon
			ctx.font = `${Math.max(radius * 0.75, 5)}px Sans-Serif`;
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillText(NODE_ICONS[type] || '○', x, y);

			// Label (always show in mini view)
			const fontSize = Math.max(9 / globalScale, 3);
			ctx.font = `600 ${fontSize}px Inter, system-ui, sans-serif`;
			ctx.textAlign = 'center';
			ctx.textBaseline = 'top';
			ctx.fillStyle = 'rgba(255,255,255,0.7)';

			// Truncate long names
			let label = node.name;
			if (label.length > 14) label = label.substring(0, 12) + '…';
			ctx.fillText(label, x, y + radius + 2);

			// Risk badge
			if (riskScore && riskScore > 40) {
				const badgeText = `${riskScore}%`;
				const badgeW = ctx.measureText(badgeText).width + 6;
				const badgeH = fontSize + 3;
				const badgeY = y + radius + 3 + fontSize + 1;
				ctx.fillStyle = riskScore > 70 ? '#dc2626aa' : '#ea580caa';
				ctx.beginPath();
				ctx.roundRect(x - badgeW / 2, badgeY, badgeW, badgeH, 2);
				ctx.fill();
				ctx.fillStyle = '#fff';
				ctx.textBaseline = 'top';
				ctx.fillText(badgeText, x, badgeY + 1);
			}
		},
		[],
	);

	return (
		<div className='bg-white/[0.02] rounded-xl border border-white/5 overflow-hidden'>
			{/* Header */}
			<div className='flex items-center gap-2 px-4 pt-3 pb-2'>
				<GitBranchPlus size={14} className='text-cyan-400' />
				<span className='text-[11px] font-bold text-gray-400 uppercase tracking-wider'>
					Transaction Graph
				</span>
			</div>

			{/* Graph Canvas */}
			<div
				ref={containerRef}
				className='relative w-full bg-[#0d0d0d] border-y border-white/5'
				style={{ height: 260 }}
			>
				<ForceGraph2D
					ref={graphRef}
					graphData={graphData}
					backgroundColor='#0d0d0d'
					width={containerRef.current?.offsetWidth || 750}
					height={260}
					nodeCanvasObject={paintNode}
					nodePointerAreaPaint={(node: any, color, ctx) => {
						const radius = Math.sqrt((node.val as number) || 72) * 3 + 8;
						ctx.fillStyle = color;
						ctx.beginPath();
						ctx.arc(node.x!, node.y!, radius, 0, 2 * Math.PI);
						ctx.fill();
					}}
					linkWidth={1.5}
					linkColor={(link: any) =>
						LINK_TYPE_COLORS[link.type] || 'rgba(255,255,255,0.06)'
					}
					linkDirectionalArrowLength={3.5}
					linkDirectionalArrowRelPos={1}
					linkDirectionalParticles={(link: any) =>
						link.type === 'PAYMENT' ? 2 : 0
					}
					linkDirectionalParticleSpeed={0.005}
					linkDirectionalParticleWidth={1.2}
					linkDirectionalParticleColor={() => '#f9731644'}
					d3AlphaDecay={0.05}
					d3VelocityDecay={0.3}
					cooldownTicks={150}
					warmupTicks={30}
					enableZoomInteraction={true}
					enablePanInteraction={true}
					enableNodeDrag={false}
				/>
			</div>

			{/* Legend */}
			<div className='px-4 py-2.5 flex flex-wrap items-center gap-x-4 gap-y-1'>
				{LEGEND_ITEMS.map((item) => (
					<div key={item.label} className='flex items-center gap-1.5'>
						<span className='text-[10px]'>{item.icon}</span>
						<span className='text-[10px] text-gray-500'>{item.label}</span>
					</div>
				))}
				<div className='w-px h-3 bg-white/10 mx-1' />
				{LINK_LEGEND.map((item) => (
					<div key={item.label} className='flex items-center gap-1.5'>
						<div
							className='w-3 h-0.5 rounded-full'
							style={{ backgroundColor: item.color }}
						/>
						<span className='text-[10px] text-gray-500'>{item.label}</span>
					</div>
				))}
			</div>
		</div>
	);
};
