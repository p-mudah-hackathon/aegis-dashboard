import React, { useState } from 'react';
import { Search } from 'lucide-react';
import type { GraphNode } from '../types';

interface SearchBarProps {
	nodes: GraphNode[];
	searchQuery: string;
	onSearchChange: (q: string) => void;
	onSelectNode: (node: GraphNode) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
	nodes,
	searchQuery,
	onSearchChange,
	onSelectNode,
}) => {
	const [isFocused, setIsFocused] = useState(false);

	const filtered =
		searchQuery.trim().length > 0
			? nodes.filter(
				(n) =>
					n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
					n.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
					n.type.toLowerCase().includes(searchQuery.toLowerCase()),
			)
			: [];

	const handleSelect = (node: GraphNode) => {
		onSelectNode(node);
		onSearchChange('');
		setIsFocused(false);
	};

	return (
		<div className='absolute top-6 left-6 z-30 w-[300px]'>
			<div
				className={`flex items-center gap-2.5 bg-[#121212]/90 backdrop-blur-md border rounded-xl px-4 py-3 transition-colors ${isFocused ? 'border-orange-500/50' : 'border-white/10'}`}
			>
				<Search size={15} className='text-gray-500 shrink-0' />
				<input
					type='text'
					value={searchQuery}
					onChange={(e) => onSearchChange(e.target.value)}
					onFocus={() => setIsFocused(true)}
					onBlur={() => setTimeout(() => setIsFocused(false), 200)}
					placeholder='Search nodes by name, ID, or type...'
					className='bg-transparent border-none outline-none text-white text-[13px] placeholder:text-gray-600 w-full'
				/>
			</div>
			
			{isFocused && filtered.length > 0 && (
				<div className='mt-2 bg-[#121212]/95 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-2xl max-h-[240px] overflow-y-auto'>
					{filtered.slice(0, 8).map((node) => (
						<button
							key={node.id}
							onMouseDown={() => handleSelect(node)}
							className='w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left'
						>
							<span className='text-sm'>
								{node.type === 'USER'
									? '👤'
									: node.type === 'MERCHANT'
										? '🏪'
										: node.type === 'TRANSACTION'
											? '💳'
											: node.type === 'ISSUER'
												? '🏦'
												: '📱'}
							</span>
							<div className='flex-1 min-w-0'>
								<div className='text-white text-xs font-semibold truncate'>
									{node.name}
								</div>
								<div className='text-gray-500 text-[10px] font-mono'>
									{node.id}
								</div>
							</div>
							{node.riskScore && node.riskScore > 70 && (
								<span
									className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${node.riskScore > 85 ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'}`}
								>
									{node.riskScore}
								</span>
							)}
						</button>
					))}
				</div>
			)}

			{isFocused && searchQuery.trim().length > 0 && filtered.length === 0 && (
				<div className='mt-2 bg-[#121212]/95 backdrop-blur-md border border-white/10 rounded-xl p-4'>
					<p className='text-gray-500 text-xs text-center'>
						No nodes found for "{searchQuery}"
					</p>
				</div>
			)}
		</div>
	);
};
