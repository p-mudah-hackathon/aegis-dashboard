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
	cardBgColor?: string;
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
	cardBgColor,
}) => {
	return (
		<div
			className={`${cardBgColor || 'bg-card'} border-2 rounded-3xl p-6 flex flex-col space-y-4 ${borderColor}`}
			style={{ minWidth: '240px' }}
		>
			<div className='flex items-start justify-between'>
				<div className='flex flex-col'>
					<span className='text-muted-foreground text-sm font-medium'>
						{title}
					</span>
					<h3 className='text-foreground text-xl font-bold mt-1'>
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
				<span className='text-4xl font-bold text-foreground'>{value}</span>
				<span className='text-muted-foreground text-sm'>{label}</span>
			</div>

			<p className='text-muted-foreground/60 text-xs italic'>{subtitle}</p>
		</div>
	);
};
