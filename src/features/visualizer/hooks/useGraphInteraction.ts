import {
	useState,
	useCallback,
	useRef,
	useEffect,
	type RefObject,
} from 'react';
import type { GraphNode, GraphLink, GraphData } from '../types';

interface LinkTooltipState {
	x: number;
	y: number;
	link: GraphLink;
}

export function useGraphInteraction(
	graphData: GraphData,
	containerRef: RefObject<HTMLDivElement | null>,
) {
	const graphRef = useRef<any>(null);

	const [hoverNode, setHoverNode] = useState<GraphNode | null>(null);
	const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
	const [selectedNodePos, setSelectedNodePos] = useState({ x: 0, y: 0 });
	const [hoverLink, setHoverLink] = useState<GraphLink | null>(null);
	const [linkTooltip, setLinkTooltip] = useState<LinkTooltipState | null>(null);
	const mousePos = useRef({ x: 0, y: 0 });
	const hoverLinkRef = useRef<GraphLink | null>(null);

	// Keep the ref in sync with state
	hoverLinkRef.current = hoverLink;

	// Track mouse position on the container for edge tooltip positioning
	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const handleMouseMove = (e: MouseEvent) => {
			const rect = container.getBoundingClientRect();
			mousePos.current = {
				x: e.clientX - rect.left,
				y: e.clientY - rect.top,
			};
			// Update tooltip position if a link is being hovered
			if (hoverLinkRef.current) {
				setLinkTooltip({
					x: mousePos.current.x,
					y: mousePos.current.y,
					link: hoverLinkRef.current,
				});
			}
		};

		container.addEventListener('mousemove', handleMouseMove);
		return () => container.removeEventListener('mousemove', handleMouseMove);
	}, [containerRef]);

	// ── Zoom controls ──
	const handleZoomIn = useCallback(
		() => graphRef.current?.zoom(graphRef.current.zoom() * 1.3, 400),
		[],
	);
	const handleZoomOut = useCallback(
		() => graphRef.current?.zoom(graphRef.current.zoom() / 1.3, 400),
		[],
	);
	const handleZoomFit = useCallback(
		() => graphRef.current?.zoomToFit(400, 60),
		[],
	);

	// ── Search: zoom + center on node ──
	const handleSearchSelect = useCallback((node: GraphNode) => {
		if (graphRef.current) {
			graphRef.current.centerAt(node.x, node.y, 600);
			graphRef.current.zoom(4, 600);
		}
	}, []);

	// ── Click on node: show card at click position ──
	const handleNodeClick = useCallback(
		(node: any, event: MouseEvent) => {
			if (selectedNode && selectedNode.id === node.id) {
				setSelectedNode(null);
				return;
			}
			if (containerRef.current) {
				const rect = containerRef.current.getBoundingClientRect();
				setSelectedNodePos({
					x: event.clientX - rect.left,
					y: event.clientY - rect.top,
				});
			}
			setSelectedNode(node);
		},
		[selectedNode, containerRef],
	);

	// ── Connection count ──
	const getConnectionCount = useCallback(
		(nodeId: string) =>
			graphData.links.filter((l) => l.source === nodeId || l.target === nodeId)
				.length,
		[graphData],
	);

	// ── Resolve node name from a link endpoint ──
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

	// ── Handle link hover ──
	const handleLinkHover = useCallback((link: any) => {
		setHoverLink(link || null);
		if (link) {
			setLinkTooltip({
				x: mousePos.current.x,
				y: mousePos.current.y,
				link: link as GraphLink,
			});
		} else {
			setLinkTooltip(null);
		}
	}, []);

	// ── Background click clears selection ──
	const handleBackgroundClick = useCallback(() => setSelectedNode(null), []);

	// ── Stats ──
	const flaggedCount = graphData.nodes.filter(
		(n) => n.riskScore && n.riskScore > 70,
	).length;

	return {
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
	};
}
