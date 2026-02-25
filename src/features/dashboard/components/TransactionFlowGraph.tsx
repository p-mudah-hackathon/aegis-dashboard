import React, {
	useRef,
	useState,
	useEffect,
	useMemo,
	useCallback,
} from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import type { Transaction } from '../types';

/* ─── Local types matching the Visualizer convention ─── */
interface FlowNode {
	id: string;
	name: string;
	type: 'USER' | 'DEVICE' | 'ISSUER' | 'MERCHANT' | 'LOCATION';
	val: number;
	color: string;
	x?: number;
	y?: number;
}

interface FlowLink {
	source: string;
	target: string;
	type: 'PAYMENT' | 'OWNERSHIP' | 'LOCATION';
	label: string;
	amount?: number;
}

interface NodeTooltipState {
	x: number;
	y: number;
	node: FlowNode;
}

interface LinkTooltipState {
	x: number;
	y: number;
	link: FlowLink & { source: any; target: any };
}

/* ─── Color palette ─── */
const TYPE_COLORS: Record<FlowNode['type'], string> = {
	USER: '#3b82f6',
	DEVICE: '#a855f7',
	ISSUER: '#22c55e',
	MERCHANT: '#f59e0b',
	LOCATION: '#ef4444',
};

const TYPE_ICONS: Record<FlowNode['type'], string> = {
	USER: '👤',
	DEVICE: '📱',
	ISSUER: '🏦',
	MERCHANT: '🏪',
	LOCATION: '📍',
};

const LINK_COLORS: Record<string, string> = {
	PAYMENT: 'rgba(249,115,22,0.25)',
	OWNERSHIP: 'rgba(59,130,246,0.20)',
	LOCATION: 'rgba(139,92,246,0.18)',
};

/* ─── The Component ─── */
interface TransactionFlowGraphProps {
	transaction: Transaction;
}

export const TransactionFlowGraph: React.FC<TransactionFlowGraphProps> = ({
	transaction: txn,
}) => {
	const graphRef = useRef<any>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const mousePos = useRef({ x: 0, y: 0 });

	const [hoverNode, setHoverNode] = useState<FlowNode | null>(null);
	const [nodeTooltip, setNodeTooltip] = useState<NodeTooltipState | null>(null);
	const [hoverLink, setHoverLink] = useState<FlowLink | null>(null);
	const [linkTooltip, setLinkTooltip] = useState<LinkTooltipState | null>(null);

	const hoverLinkRef = useRef<FlowLink | null>(null);
	hoverLinkRef.current = hoverLink;

	/* ── Build graph data from the transaction ── */
	const graphData = useMemo(() => {
		const nodes: FlowNode[] = [
			{
				id: txn.userId,
				name: txn.userId,
				type: 'USER',
				val: 12,
				color: TYPE_COLORS.USER,
			},
			{
				id: txn.deviceId,
				name: `${txn.deviceId} (${txn.deviceOs})`,
				type: 'DEVICE',
				val: 8,
				color: TYPE_COLORS.DEVICE,
			},
			{
				id: txn.issuerId,
				name: `${txn.issuerId} (${txn.issuerCountry})`,
				type: 'ISSUER',
				val: 10,
				color: TYPE_COLORS.ISSUER,
			},
			{
				id: txn.merchantId,
				name: txn.merchantId,
				type: 'MERCHANT',
				val: 10,
				color: TYPE_COLORS.MERCHANT,
			},
			{
				id: `loc-${txn.merchantCity}`,
				name: txn.merchantCity,
				type: 'LOCATION',
				val: 8,
				color: TYPE_COLORS.LOCATION,
			},
		];

		const links: FlowLink[] = [
			{
				source: txn.userId,
				target: txn.deviceId,
				type: 'OWNERSHIP',
				label: 'uses',
			},
			{
				source: txn.userId,
				target: txn.issuerId,
				type: 'PAYMENT',
				label: 'via',
				amount: txn.amountIdr,
			},
			{
				source: txn.issuerId,
				target: txn.merchantId,
				type: 'PAYMENT',
				label: 'pays',
				amount: txn.amountIdr,
			},
			{
				source: txn.merchantId,
				target: `loc-${txn.merchantCity}`,
				type: 'LOCATION',
				label: 'at',
			},
		];

		return { nodes, links };
	}, [txn]);

	/* ── Zoom to fit on mount ── */
	useEffect(() => {
		const fg = graphRef.current;
		if (!fg) return;
		fg.d3Force('charge')?.strength(-100);
		fg.d3Force('link')?.distance(50);
		const t = setTimeout(() => fg.zoomToFit(300, 35), 600);
		return () => clearTimeout(t);
	}, [graphData]);

	/* ── Track mouse position for tooltips ── */
	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;
		const onMove = (e: MouseEvent) => {
			const rect = el.getBoundingClientRect();
			mousePos.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
			if (hoverLinkRef.current) {
				setLinkTooltip({
					x: mousePos.current.x,
					y: mousePos.current.y,
					link: hoverLinkRef.current as any,
				});
			}
		};
		el.addEventListener('mousemove', onMove);
		return () => el.removeEventListener('mousemove', onMove);
	}, []);

	/* ── Node hover handler ── */
	const handleNodeHover = useCallback((node: any) => {
		setHoverNode(node || null);
		if (node) {
			setNodeTooltip({
				x: mousePos.current.x,
				y: mousePos.current.y,
				node: node as FlowNode,
			});
		} else {
			setNodeTooltip(null);
		}
	}, []);

	/* ── Link hover handler ── */
	const handleLinkHover = useCallback((link: any) => {
		setHoverLink(link || null);
		if (link) {
			setLinkTooltip({
				x: mousePos.current.x,
				y: mousePos.current.y,
				link: link as any,
			});
		} else {
			setLinkTooltip(null);
		}
	}, []);

	/* ── Node painter (same style as Visualizer) ── */
	const paintNode = useCallback(
		(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
			const n = node as FlowNode;
			const x = node.x!;
			const y = node.y!;
			const radius = Math.sqrt(n.val) * 1.8;
			const isHovered = node === hoverNode;

			// Hover glow
			if (isHovered) {
				ctx.beginPath();
				ctx.arc(x, y, radius + 6, 0, 2 * Math.PI);
				const grad = ctx.createRadialGradient(x, y, radius, x, y, radius + 6);
				grad.addColorStop(0, `${n.color}44`);
				grad.addColorStop(1, `${n.color}00`);
				ctx.fillStyle = grad;
				ctx.fill();
			}

			// Circle
			ctx.beginPath();
			ctx.arc(x, y, radius, 0, 2 * Math.PI);
			ctx.fillStyle = '#1a1a1a';
			ctx.fill();
			ctx.strokeStyle = isHovered ? n.color : `${n.color}88`;
			ctx.lineWidth = isHovered ? 2.5 : 1.2;
			ctx.stroke();

			// Icon
			ctx.font = `${Math.max(radius * 0.8, 6)}px Sans-Serif`;
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillText(TYPE_ICONS[n.type], x, y);

			// Label (always visible since the graph is small)
			const fontSize = Math.max(10 / globalScale, 3);
			ctx.font = `600 ${fontSize}px Inter, system-ui, sans-serif`;
			ctx.textAlign = 'center';
			ctx.textBaseline = 'top';
			ctx.fillStyle = isHovered ? '#ffffff' : 'rgba(255,255,255,0.55)';
			ctx.fillText(n.name, x, y + radius + 3);
		},
		[hoverNode],
	);

	/* ── Resolve node name from link endpoint ── */
	const getNodeName = useCallback(
		(endpoint: any): string => {
			if (typeof endpoint === 'string') {
				const found = graphData.nodes.find((n) => n.id === endpoint);
				return found ? found.name : endpoint;
			}
			return endpoint?.name || endpoint?.id || '—';
		},
		[graphData],
	);

	return (
		<div className='bg-white/[0.02] rounded-xl border border-white/5 overflow-hidden'>
			<div className='px-4 pt-3 pb-1 flex items-center gap-2'>
				<span className='text-[11px]'>🔗</span>
				<span className='text-[11px] font-bold text-gray-400 uppercase tracking-wider'>
					Fund Flow
				</span>
			</div>

			<div ref={containerRef} className='relative' style={{ height: 220 }}>
				<ForceGraph2D
					ref={graphRef}
					graphData={graphData}
					width={450}
					height={220}
					backgroundColor='transparent'
					nodeCanvasObject={paintNode}
					nodePointerAreaPaint={(node: any, color, ctx) => {
						const radius = Math.sqrt((node.val as number) || 10) * 1.8 + 4;
						ctx.fillStyle = color;
						ctx.beginPath();
						ctx.arc(node.x!, node.y!, radius, 0, 2 * Math.PI);
						ctx.fill();
					}}
					onNodeHover={handleNodeHover}
					onLinkHover={handleLinkHover}
					linkWidth={(link: any) => (link === hoverLink ? 2.5 : 0.7)}
					linkColor={(link: any) => {
						if (link === hoverLink) return '#f97316';
						return LINK_COLORS[link.type] || 'rgba(255,255,255,0.06)';
					}}
					linkDirectionalArrowLength={4}
					linkDirectionalArrowRelPos={1}
					linkDirectionalParticles={(link: any) =>
						link.type === 'PAYMENT' ? 2 : 0
					}
					linkDirectionalParticleSpeed={0.004}
					linkDirectionalParticleWidth={1.5}
					linkDirectionalParticleColor={() => '#f9731644'}
					enableNodeDrag={false}
					cooldownTicks={200}
					warmupTicks={50}
				/>

				{/* Node Tooltip — appears on hover */}
				{nodeTooltip && (
					<div
						className='absolute pointer-events-none z-50'
						style={{
							top: nodeTooltip.y,
							left: nodeTooltip.x,
							transform: 'translate(16px, -50%)',
						}}
					>
						<div className='bg-[#1a1a1a] rounded-xl shadow-2xl border border-white/10 overflow-hidden min-w-[160px]'>
							<div
								className='px-3 py-2 border-b border-white/5'
								style={{
									borderTopColor: nodeTooltip.node.color,
									borderTopWidth: 2,
								}}
							>
								<span className='text-[10px] font-bold uppercase tracking-wider text-gray-400'>
									{TYPE_ICONS[nodeTooltip.node.type]} {nodeTooltip.node.type}
								</span>
							</div>
							<div className='px-3 py-2'>
								<div className='flex justify-between items-center gap-4'>
									<span className='text-[11px] text-gray-500'>Name</span>
									<span className='text-[12px] font-semibold text-white'>
										{nodeTooltip.node.name}
									</span>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Edge Tooltip — appears on hover (same style as Visualizer) */}
				{linkTooltip && (
					<div
						className='absolute pointer-events-none z-50'
						style={{
							top: linkTooltip.y,
							left: linkTooltip.x,
							transform: 'translate(16px, -50%)',
						}}
					>
						<div className='bg-[#1a1a1a] rounded-xl shadow-2xl border border-white/10 overflow-hidden min-w-[180px]'>
							<div
								className='px-3 py-2 border-b border-white/5'
								style={{
									borderTopColor:
										linkTooltip.link.type === 'PAYMENT'
											? '#f97316'
											: linkTooltip.link.type === 'OWNERSHIP'
												? '#3b82f6'
												: '#8b5cf6',
									borderTopWidth: 2,
								}}
							>
								<span className='text-[10px] font-bold uppercase tracking-wider text-gray-400'>
									{linkTooltip.link.type === 'PAYMENT'
										? '💳 Payment'
										: linkTooltip.link.type === 'OWNERSHIP'
											? '🔗 Ownership'
											: '📍 Location'}
								</span>
							</div>
							<div className='px-3 py-2 space-y-1.5'>
								<div className='flex justify-between items-center gap-4'>
									<span className='text-[11px] text-gray-500'>From</span>
									<span className='text-[12px] font-semibold text-white'>
										{getNodeName(linkTooltip.link.source)}
									</span>
								</div>
								<div className='flex justify-between items-center gap-4'>
									<span className='text-[11px] text-gray-500'>To</span>
									<span className='text-[12px] font-semibold text-white'>
										{getNodeName(linkTooltip.link.target)}
									</span>
								</div>
								{linkTooltip.link.amount && (
									<div className='flex justify-between items-center gap-4 pt-1 border-t border-white/5'>
										<span className='text-[11px] text-gray-500'>Amount</span>
										<span className='text-[12px] font-bold text-orange-400'>
											IDR {linkTooltip.link.amount.toLocaleString('id-ID')}
										</span>
									</div>
								)}
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Legend */}
			<div className='px-4 pb-3 flex flex-wrap gap-3'>
				{Object.entries(TYPE_COLORS).map(([type, color]) => (
					<div key={type} className='flex items-center gap-1.5'>
						<div
							className='size-2 rounded-full'
							style={{ backgroundColor: color }}
						/>
						<span className='text-[9px] text-gray-500 capitalize'>
							{type.toLowerCase()}
						</span>
					</div>
				))}
			</div>
		</div>
	);
};
