import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
	title: string;
	value: string | number;
	label: string;
	subtitle: string;
	icon: LucideIcon;
	borderColor: string;
	iconBgColor: string;
	iconColor: string;
}

export const StatCard: React.FC<StatCardProps> = ({
	title,
	value,
	label,
	subtitle,
	icon: Icon,
	borderColor,
	iconBgColor,
	iconColor,
}) => {
	return (
		<div
			className={`bg-[#121212]/50 border-2 rounded-3xl p-6 flex flex-col space-y-4 ${borderColor}`}
			style={{ minWidth: '240px' }}
		>
			<div className='flex items-start justify-between'>
				<div className='flex flex-col'>
					<span className='text-gray-400 text-sm font-medium'>{title}</span>
					<h3 className='text-white text-xl font-bold mt-1'>
						{title.split(' ')[0]}
						<br />
						{title.split(' ').slice(1).join(' ')}
					</h3>
				</div>
				<div className={`p-3 rounded-xl ${iconBgColor}`}>
					<Icon className={`size-6 ${iconColor}`} />
				</div>
			</div>

			<div className='flex items-baseline space-x-2'>
				<span className='text-4xl font-bold text-white'>{value}</span>
				<span className='text-gray-400 text-sm'>{label}</span>
			</div>

			<p className='text-gray-500 text-xs italic'>{subtitle}</p>
		</div>
	);
};
