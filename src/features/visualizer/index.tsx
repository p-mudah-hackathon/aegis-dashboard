import React, { useRef, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { QRIS_GRAPH_DATA, LINK_TYPE_COLORS } from './constants';

import { useContainerDimensions } from './hooks/useContainerDimensions';
import { usePulseAnimation } from './hooks/usePulseAnimation';
import { useNodePainter } from './hooks/useNodePainter';
import { useGraphInteraction } from './hooks/useGraphInteraction';

import { ZoomControls } from './components/ZoomControls';
import { Legend } from './components/Legend';
import { NetworkStats } from './components/NetworkStats';
import { SearchBar } from './components/SearchBar';
import { NodeCard } from './components/NodeCard';
import { EdgeTooltip } from './components/EdgeTooltip';

export const Visualizer: React.FC = () => {
	const containerRef = useRef<HTMLDivElement>(null);
	const graphData = useMemo(() => QRIS_GRAPH_DATA, []);

	// ── Hooks ──
	const dimensions = useContainerDimensions(containerRef);
	const pulsePhase = usePulseAnimation();

	const {
		graphRef,
		hoverNode,
		setHoverNode,
		selectedNode,
		selectedNodePos,
		hoverLink,
		linkTooltip,
		handleZoomIn,
		handleZoomOut,
		handleZoomFit,
		handleSearchSelect,
		handleNodeClick,
		handleBackgroundClick,
		handleLinkHover,
		getConnectionCount,
		getNodeName,
		flaggedCount,
	} = useGraphInteraction(graphData, containerRef);

	const paintNode = useNodePainter(hoverNode, selectedNode, pulsePhase);

	return (
		<div
			className='flex-1 h-full w-full bg-[#0a0a0a] overflow-hidden relative'
			ref={containerRef}
		>
			{/* Graph */}
			<ForceGraph2D
				ref={graphRef}
				graphData={graphData}
				backgroundColor='#0a0a0a'
				width={dimensions.width}
				height={dimensions.height}
				nodeCanvasObject={paintNode}
				nodePointerAreaPaint={(node: any, color, ctx) => {
					const radius = Math.sqrt((node.val as number) || 10) * 1.8 + 4;
					ctx.fillStyle = color;
					ctx.beginPath();
					ctx.arc(node.x!, node.y!, radius, 0, 2 * Math.PI);
					ctx.fill();
				}}
				onNodeHover={(node: any) => setHoverNode(node)}
				onNodeClick={handleNodeClick}
				onBackgroundClick={handleBackgroundClick}
				onLinkHover={handleLinkHover}
				linkWidth={(link: any) => (link === hoverLink ? 2.5 : 0.7)}
				linkColor={(link: any) => {
					if (link === hoverLink) return '#f97316';
					return LINK_TYPE_COLORS[link.type] || 'rgba(255,255,255,0.06)';
				}}
				linkDirectionalParticles={(link: any) =>
					link.type === 'PAYMENT' ? 2 : 0
				}
				linkDirectionalParticleSpeed={0.004}
				linkDirectionalParticleWidth={1.5}
				linkDirectionalParticleColor={() => '#f9731644'}
				linkDirectionalArrowLength={4}
				linkDirectionalArrowRelPos={1}
				d3AlphaDecay={0.03}
				d3VelocityDecay={0.3}
				cooldownTicks={200}
				warmupTicks={50}
			/>

			{/* Edge Tooltip */}
			{linkTooltip && (
				<EdgeTooltip
					link={linkTooltip.link}
					position={{ x: linkTooltip.x, y: linkTooltip.y }}
					getNodeName={getNodeName}
				/>
			)}

			{/* Node Card — click-based, interactive */}
			{selectedNode && (
				<NodeCard
					node={selectedNode}
					connectionCount={getConnectionCount(selectedNode.id)}
					position={selectedNodePos}
					containerSize={dimensions}
					onClose={handleBackgroundClick}
				/>
			)}

			{/* UI Overlays */}
			<SearchBar nodes={graphData.nodes} onSelectNode={handleSearchSelect} />
			<ZoomControls
				onZoomIn={handleZoomIn}
				onZoomOut={handleZoomOut}
				onZoomFit={handleZoomFit}
			/>
			<Legend />
			<NetworkStats
				nodeCount={graphData.nodes.length}
				edgeCount={graphData.links.length}
				flaggedCount={flaggedCount}
			/>
		</div>
	);
};
