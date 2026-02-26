import React, { useRef, useState, useEffect } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import {
	LINK_TYPE_COLORS,
	EMPTY_GRAPH,
	buildGraphFromTransactions,
} from './constants';
import { getTransactions } from '../../api';

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
import { Loader2 } from 'lucide-react';

import type { GraphData } from './types';
import { useNavigate } from 'react-router-dom';

export const Visualizer: React.FC = () => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [graphData, setGraphData] = useState<GraphData>(EMPTY_GRAPH);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState('');
	const navigate = useNavigate();

	useEffect(() => {
		(async () => {
			try {
				const data = await getTransactions({
					page_size: 100,
					sort_by: 'created_at',
					sort_order: 'desc',
				});
				const graph = buildGraphFromTransactions(data.items);
				setGraphData(graph);
			} catch (e) {
				console.error('Visualizer: failed to fetch transactions', e);
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	const dimensions = useContainerDimensions(containerRef);
	const pulsePhase = usePulseAnimation();

	const {
		graphRef,
		hoverNode,
		handleNodeHover,
		selectedNode,
		selectedNodePos,
		hoverLink,
		linkTooltip,
		cursorMode,
		connectedNodeIds,
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

	const paintNode = useNodePainter(
		hoverNode,
		selectedNode,
		pulsePhase,
		searchQuery,
		connectedNodeIds,
	);

	// Increase spacing between nodes
	const showGraph = !loading && graphData.nodes.length > 0;

	useEffect(() => {
		if (graphRef.current) {
			graphRef.current.d3Force('charge')?.strength(-150);
			graphRef.current.d3Force('link')?.distance(80);
		}
	}, [graphRef, showGraph]);

	return (
		<div
			className='flex-1 h-full w-full bg-[#0a0a0a] overflow-hidden relative'
			ref={containerRef}
			style={{ cursor: cursorMode }}
		>
			{loading && (
				<div className='absolute inset-0 flex items-center justify-center bg-[#0a0a0a] z-50'>
					<Loader2 className='size-8 animate-spin text-orange-500' />
					<span className='ml-3 text-gray-400'>
						Loading transaction graph...
					</span>
				</div>
			)}
			{!loading && graphData.nodes.length === 0 && (
				<div className='absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a0a] text-gray-500 z-50'>
					<p className='text-lg mb-2'>No transactions to visualize</p>
					<p className='text-sm'>
						Start the Data Filler to generate transactions first
					</p>
				</div>
			)}

			{showGraph && (
				<>
					<ForceGraph2D
						ref={graphRef}
						graphData={graphData}
						backgroundColor='#0a0a0a'
						width={dimensions.width}
						height={dimensions.height}
						nodeCanvasObject={paintNode}
						nodePointerAreaPaint={(node: any, color, ctx) => {
							const radius = Math.sqrt((node.val as number) || 72) * 5 + 10;
							ctx.fillStyle = color;
							ctx.beginPath();
							ctx.arc(node.x!, node.y!, radius, 0, 2 * Math.PI);
							ctx.fill();
						}}
						onNodeHover={handleNodeHover}
						onNodeClick={handleNodeClick}
						onBackgroundClick={handleBackgroundClick}
						onLinkHover={handleLinkHover}
						linkWidth={(link: any) => (link === hoverLink ? 3.5 : 1.7)}
						linkColor={(link: any) => {
							if (link === hoverLink) return '#ffffff';

							if (selectedNode && connectedNodeIds.size > 0) {
								const srcId =
									typeof link.source === 'string'
										? link.source
										: link.source?.id;
								const tgtId =
									typeof link.target === 'string'
										? link.target
										: link.target?.id;
								const isConnected =
									connectedNodeIds.has(srcId) && connectedNodeIds.has(tgtId);
								if (!isConnected) return 'rgba(255,255,255,0.02)';
							}

							if (searchQuery.trim()) {
								const q = searchQuery.toLowerCase();
								const sName = (link.source.name || '').toLowerCase();
								const sId = (link.source.id || '').toLowerCase();
								const sType = (link.source.type || '').toLowerCase();
								const tName = (link.target.name || '').toLowerCase();
								const tId = (link.target.id || '').toLowerCase();
								const tType = (link.target.type || '').toLowerCase();

								const sourceMatches =
									sName.includes(q) || sId.includes(q) || sType.includes(q);
								const targetMatches =
									tName.includes(q) || tId.includes(q) || tType.includes(q);

								if (!sourceMatches && !targetMatches)
									return 'rgba(255,255,255,0.01)';
							}

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
						d3AlphaDecay={0.02}
						d3VelocityDecay={0.25}
						cooldownTicks={200}
						warmupTicks={50}
					/>

					{linkTooltip && (
						<EdgeTooltip
							link={linkTooltip.link}
							position={{ x: linkTooltip.x, y: linkTooltip.y }}
							getNodeName={getNodeName}
						/>
					)}

					{selectedNode && (
						<NodeCard
							node={selectedNode}
							connectionCount={getConnectionCount(selectedNode.id)}
							position={selectedNodePos}
							containerSize={dimensions}
							onClose={handleBackgroundClick}
							onInvestigate={(id) => navigate('/investigate/' + id)}
						/>
					)}

					<SearchBar
						nodes={graphData.nodes}
						searchQuery={searchQuery}
						onSearchChange={setSearchQuery}
						onSelectNode={handleSearchSelect}
					/>
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
				</>
			)}
		</div>
	);
};
