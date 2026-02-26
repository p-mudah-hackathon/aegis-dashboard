import {
	useState,
	useCallback,
	useRef,
	useEffect,
	type RefObject,
} from 'react';
import type { GraphNode, GraphLink, GraphData } from '../types';

type CursorMode = 'default' | 'pointer' | 'grabbing';

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
	const [cursorMode, setCursorMode] = useState<CursorMode>('default');
	const [connectedNodeIds, setConnectedNodeIds] = useState<Set<string>>(
		new Set(),
	);
	const mousePos = useRef({ x: 0, y: 0 });
	const hoverLinkRef = useRef<GraphLink | null>(null);

	hoverLinkRef.current = hoverLink;

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const handleMouseMove = (e: MouseEvent) => {
			const rect = container.getBoundingClientRect();
			mousePos.current = {
				x: e.clientX - rect.left,
				y: e.clientY - rect.top,
			};
			if (hoverLinkRef.current) {
				setLinkTooltip({
					x: mousePos.current.x,
					y: mousePos.current.y,
					link: hoverLinkRef.current,
				});
			}
		};

		const handleMouseDown = () => setCursorMode('grabbing');
		const handleMouseUp = () => setCursorMode('default');

		container.addEventListener('mousemove', handleMouseMove);
		container.addEventListener('mousedown', handleMouseDown);
		container.addEventListener('mouseup', handleMouseUp);
		return () => {
			container.removeEventListener('mousemove', handleMouseMove);
			container.removeEventListener('mousedown', handleMouseDown);
			container.removeEventListener('mouseup', handleMouseUp);
		};
	}, [containerRef]);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				setSelectedNode(null);
				setConnectedNodeIds(new Set());
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, []);

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

	const handleSearchSelect = useCallback(
		(node: GraphNode) => {
			if (graphRef.current) {
				graphRef.current.centerAt(node.x, node.y, 600);
				graphRef.current.zoom(4, 600);
			}
			setHoverNode(node);
			const ids = new Set<string>([node.id]);
			for (const link of graphData.links) {
				const srcId =
					typeof link.source === 'string'
						? link.source
						: (link.source as any)?.id;
				const tgtId =
					typeof link.target === 'string'
						? link.target
						: (link.target as any)?.id;
				if (srcId === node.id) ids.add(tgtId);
				if (tgtId === node.id) ids.add(srcId);
			}
			setConnectedNodeIds(ids);
		},
		[graphData.links],
	);

	const handleNodeClick = useCallback(
		(node: any, event: MouseEvent) => {
			if (selectedNode && selectedNode.id === node.id) {
				setSelectedNode(null);
				setConnectedNodeIds(new Set());
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
			const ids = new Set<string>([node.id]);
			for (const link of graphData.links) {
				const srcId =
					typeof link.source === 'string'
						? link.source
						: (link.source as any)?.id;
				const tgtId =
					typeof link.target === 'string'
						? link.target
						: (link.target as any)?.id;
				if (srcId === node.id) ids.add(tgtId);
				if (tgtId === node.id) ids.add(srcId);
			}
			setConnectedNodeIds(ids);
		},
		[selectedNode, containerRef, graphData.links],
	);

	const getConnectionCount = useCallback(
		(nodeId: string) =>
			graphData.links.filter((l) => l.source === nodeId || l.target === nodeId)
				.length,
		[graphData],
	);

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

	const handleNodeHover = useCallback((node: any) => {
		setHoverNode(node || null);
		setCursorMode(node ? 'pointer' : 'default');
	}, []);

	const selectedNodeRef = useRef<string | null>(null);
	selectedNodeRef.current = selectedNode?.id ?? null;

	const handleLinkHover = useCallback((link: any) => {
		if (!link) {
			setHoverLink(null);
			setCursorMode('default');
			setLinkTooltip(null);
			return;
		}

		// If a node is selected, only allow hover on its connected edges
		if (selectedNodeRef.current) {
			const srcId =
				typeof link.source === 'string' ? link.source : link.source?.id;
			const tgtId =
				typeof link.target === 'string' ? link.target : link.target?.id;
			if (
				srcId !== selectedNodeRef.current &&
				tgtId !== selectedNodeRef.current
			) {
				return;
			}
		}

		setHoverLink(link);
		setCursorMode('pointer');
		if (mousePos.current.x > 0 && mousePos.current.y > 0) {
			setLinkTooltip({
				x: mousePos.current.x,
				y: mousePos.current.y,
				link: link as GraphLink,
			});
		}
	}, []);

	const handleBackgroundClick = useCallback(() => {
		setSelectedNode(null);
		setConnectedNodeIds(new Set());
	}, []);

	const flaggedCount = graphData.nodes.filter(
		(n) => n.riskScore && n.riskScore > 70,
	).length;

	return {
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
	};
}
