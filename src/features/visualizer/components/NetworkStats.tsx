import React from 'react';

interface NetworkStatsProps {
	nodeCount: number;
	edgeCount: number;
	flaggedCount: number;
}

export const NetworkStats: React.FC<NetworkStatsProps> = ({
	nodeCount,
	edgeCount,
	flaggedCount,
}) => {
	const stats = [
		{ label: 'Nodes', value: nodeCount },
		{ label: 'Edges', value: edgeCount },
		{ label: 'Flagged', value: flaggedCount },
	];

	return (
		<div className='absolute bottom-8 right-8 bg-[#121212]/90 backdrop-blur-md border border-white/10 rounded-2xl p-6 z-20'>
			<div className='flex gap-8'>
				{stats.map((stat, i) => (
					<div key={i} className='text-center'>
						<div className='text-white text-2xl font-bold'>{stat.value}</div>
						<div className='text-gray-500 text-[10px] uppercase tracking-widest font-semibold mt-1'>
							{stat.label}
						</div>
					</div>
				))}
			</div>
		</div>
	);
};
