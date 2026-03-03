import React, { useState, useEffect } from 'react';
import { Radio } from 'lucide-react';

interface NetworkStatsProps {
	nodeCount: number;
	edgeCount: number;
	flaggedCount: number;
	isLive?: boolean;
	lastUpdated?: Date | null;
	onToggleLive?: () => void;
}

function formatTimeAgo(date: Date): string {
	const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
	if (seconds < 5) return 'just now';
	if (seconds < 60) return `${seconds}s ago`;
	const minutes = Math.floor(seconds / 60);
	if (minutes < 60) return `${minutes}m ago`;
	return `${Math.floor(minutes / 60)}h ago`;
}

export const NetworkStats: React.FC<NetworkStatsProps> = ({
	nodeCount,
	edgeCount,
	flaggedCount,
	isLive = false,
	lastUpdated = null,
	onToggleLive,
}) => {
	const [, setTick] = useState(0);

	// Re-render every second to update "X ago" text
	useEffect(() => {
		if (!isLive || !lastUpdated) return;
		const id = setInterval(() => setTick((t) => t + 1), 1000);
		return () => clearInterval(id);
	}, [isLive, lastUpdated]);

	const stats = [
		{ label: 'Nodes', value: nodeCount },
		{ label: 'Edges', value: edgeCount },
		{ label: 'Flagged', value: flaggedCount },
	];

	return (
		<div className='absolute bottom-8 right-8 z-20 flex flex-col items-stretch gap-3'>
			{/* Live Toggle Button */}
			{onToggleLive && (
				<button
					onClick={onToggleLive}
					className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl border backdrop-blur-md transition-all duration-300 text-sm font-semibold ${
						isLive
							? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-lg shadow-emerald-500/10'
							: 'bg-surface-2/80 border-border-subtle text-text-muted hover:text-text-primary hover:border-border-default'
					}`}
					title={isLive ? 'Stop live updates' : 'Start live updates'}
				>
					<Radio className={`size-4 ${isLive ? 'animate-pulse' : ''}`} />
					{isLive ? 'LIVE' : 'Go Live'}
					{isLive && lastUpdated && (
						<span className='text-[10px] font-normal opacity-70 ml-1'>
							· {formatTimeAgo(lastUpdated)}
						</span>
					)}
				</button>
			)}

			<div className='bg-surface-2/90 backdrop-blur-md border border-border-subtle rounded-2xl p-6 shadow-xl'>
				{/* {isLive && (
					<div className='flex items-center justify-center gap-2 mb-4 pb-3 border-b border-border-subtle'>
						<span className='relative flex size-2.5'>
							<span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75'></span>
							<span className='relative inline-flex rounded-full size-2.5 bg-emerald-500'></span>
						</span>
						<span className='text-emerald-400 text-[10px] uppercase tracking-widest font-bold'>
							Live
						</span>
					</div>
				)} */}
				<div className='flex gap-8'>
					{stats.map((stat, i) => (
						<div key={i} className='text-center'>
							<div className='text-text-primary text-2xl font-bold'>
								{stat.value}
							</div>
							<div className='text-text-muted text-[10px] uppercase tracking-widest font-semibold mt-1'>
								{stat.label}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};
