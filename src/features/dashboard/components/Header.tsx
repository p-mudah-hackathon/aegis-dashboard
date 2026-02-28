import React from 'react';
import { Bell, LogOut, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
	return (
		<header className='flex items-center justify-between mb-8'>
			<div>
				<h1 className='text-foreground text-3xl font-bold tracking-tight'>
					AEGIS Fraud Detection Dashboard
				</h1>
				<p className='text-muted-foreground text-sm mt-1 italic'>
					AI-Powered QRIS Transaction Monitoring & Risk Analysis
				</p>
			</div>

			<div className='flex items-center gap-6'>
				<button className='relative p-3 bg-muted rounded-full border border-border hover:bg-accent transition-colors group'>
					<Bell className='size-5 text-muted-foreground group-hover:text-foreground' />
					<span className='absolute top-3 right-3 size-2 bg-danger rounded-full border-2 border-background'></span>
				</button>

				<div className='flex items-center gap-3 pl-6 border-l border-border'>
					<div className='flex flex-col items-end'>
						<span className='text-foreground text-sm font-semibold'>
							Tiffany Michelle
						</span>
						<span className='text-muted-foreground text-xs'>
							tiffany.m.sugiono@gmail.com
						</span>
					</div>
					<div className='size-10 rounded-full bg-linear-to-br from-yellow-400 to-orange-500 p-0.5'>
						<div className='shrink-0 size-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center'>
							<Sparkles size={16} className='text-primary' />
						</div>
					</div>
					<button className='ml-2 p-2 text-muted-foreground hover:text-foreground transition-colors'>
						<LogOut className='size-5' />
					</button>
				</div>
			</div>
		</header>
	);
};
