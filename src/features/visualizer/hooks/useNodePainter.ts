import { useCallback } from 'react';
import type { GraphNode } from '../types';
import { NODE_ICONS } from '../constants';

/**
 * Returns a `paintNode` callback for rendering custom canvas nodes
 * on the ForceGraph2D component.
 */
export function useNodePainter(
	hoverNode: GraphNode | null,
	selectedNode: GraphNode | null,
	pulsePhase: number,
	searchQuery: string = '',
	connectedNodeIds: Set<string> = new Set(),
) {
	return useCallback(
		(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
			const { x, y, type, riskScore } = node;
			const radius = Math.sqrt((node.val as number) || 72) * 1.8;
			const isHovered = node === hoverNode;
			const isSelected = selectedNode && node.id === selectedNode.id;

			let isDimmed = false;
			if (searchQuery.trim()) {
				const q = searchQuery.toLowerCase();
				const matches =
					(node.name || '').toLowerCase().includes(q) ||
					(node.id || '').toLowerCase().includes(q) ||
					(node.type || '').toLowerCase().includes(q);
				if (!matches) isDimmed = true;
			}

			if (
				!isDimmed &&
				connectedNodeIds.size > 0 &&
				!connectedNodeIds.has(node.id)
			) {
				isDimmed = true;
			}

			ctx.globalAlpha = isDimmed ? 0.12 : 1.0;

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

			if (isHovered || isSelected) {
				ctx.beginPath();
				ctx.arc(x, y, radius + 6, 0, 2 * Math.PI);
				const grad = ctx.createRadialGradient(x, y, radius, x, y, radius + 6);
				grad.addColorStop(0, `${borderColor}44`);
				grad.addColorStop(1, `${borderColor}00`);
				ctx.fillStyle = grad;
				ctx.fill();
			}

			// High-risk pulsing border (2.5s cycle)
			if (riskScore && riskScore > 70) {
				const pulseOpacity =
					0.3 + 0.7 * (0.5 + 0.5 * Math.sin(pulsePhase * 2 * Math.PI));
				const pulseRadius =
					radius + 3 + Math.sin(pulsePhase * 2 * Math.PI) * 1.5;

				ctx.beginPath();
				ctx.arc(x, y, pulseRadius, 0, 2 * Math.PI);
				ctx.strokeStyle = `rgba(239, 68, 68, ${pulseOpacity})`;
				ctx.lineWidth = 2;
				ctx.stroke();
			}

			// Main circle
			ctx.beginPath();
			ctx.arc(x, y, radius, 0, 2 * Math.PI);
			ctx.fillStyle = '#1a1a1a';
			ctx.fill();
			ctx.strokeStyle =
				isHovered || isSelected ? borderColor : `${borderColor}88`;
			ctx.lineWidth = isHovered || isSelected ? 2.5 : 1.2;
			ctx.stroke();

			// Icon
			ctx.font = `${Math.max(radius * 0.8, 6)}px Sans-Serif`;
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillText(NODE_ICONS[type] || '○', x, y);

			// Label
			if (globalScale > 1.2 || isHovered || isSelected) {
				const fontSize = Math.max(10 / globalScale, 3);
				ctx.font = `600 ${fontSize}px Inter, system-ui, sans-serif`;
				ctx.textAlign = 'center';
				ctx.textBaseline = 'top';
				ctx.fillStyle =
					isHovered || isSelected ? '#ffffff' : 'rgba(255,255,255,0.55)';
				ctx.fillText(node.name, x, y + radius + 3);

				if (riskScore && riskScore > 70) {
					const badgeText = `Risk: ${riskScore}`;
					const badgeW = ctx.measureText(badgeText).width + 8;
					const badgeH = fontSize + 4;
					const badgeY = y + radius + 4 + fontSize + 2;
					ctx.fillStyle = riskScore > 85 ? '#dc2626aa' : '#ea580caa';
					ctx.beginPath();
					ctx.roundRect(x - badgeW / 2, badgeY, badgeW, badgeH, 3);
					ctx.fill();
					ctx.fillStyle = '#fff';
					ctx.textBaseline = 'top';
					ctx.fillText(badgeText, x, badgeY + 2);
				}
			}

			// Reset alpha for other canvas elements
			ctx.globalAlpha = 1.0;
		},
		[hoverNode, selectedNode, pulsePhase, searchQuery, connectedNodeIds],
	);
}
