import React from 'react';

export const Legend: React.FC = () => {
	const items = [
		{ color: '#ef4444', label: 'Transaction' },
		{ color: '#3b82f6', label: 'User' },
		{ color: '#f59e0b', label: 'Merchant' },
		{ color: '#10b981', label: 'Issuer' },
		{ color: '#8b5cf6', label: 'Device' },
		{ color: '#ef4444', label: 'High Risk', dashed: true },
	];

	return (
		<div className='absolute bottom-8 left-8 bg-surface-2/90 backdrop-blur-md border border-border-subtle rounded-2xl p-6 z-20 min-w-[300px] shadow-xl'>
			<div className='flex items-center gap-2.5 mb-5'>
				<div className='size-2 rounded-full bg-primary animate-pulse' />
				<span className='text-xs font-bold uppercase tracking-[0.15em] text-text-muted'>
					HTGNN Live Analysis
				</span>
			</div>
			<div className='grid grid-cols-3 gap-x-4 gap-y-3'>
				{items.map((item, i) => (
					<div key={i} className='flex items-center gap-2.5'>
						<div
							className='size-3 rounded-full shrink-0'
							style={{
								backgroundColor: item.dashed ? 'transparent' : item.color,
								border: item.dashed ? `2px dashed ${item.color}` : 'none',
							}}
						/>
						<span className='text-text-secondary text-xs font-medium'>
							{item.label}
						</span>
					</div>
				))}
			</div>
		</div>
	);
};
