import React from 'react';
import { Bell, LogOut } from 'lucide-react';

export const Header: React.FC = () => {
	return (
		<header className='flex items-center justify-between mb-8'>
			<div>
				<h1 className='text-white text-3xl font-bold tracking-tight'>
					AEGIS Fraud Detection Dashboard
				</h1>
				<p className='text-gray-500 text-sm mt-1 italic'>
					AI-Powered QRIS Transaction Monitoring & Risk Analysis
				</p>
			</div>

			<div className='flex items-center gap-6'>
				<button className='relative p-3 bg-[#1a1a1a] rounded-full border border-white/5 hover:bg-white/5 transition-colors group'>
					<Bell className='size-5 text-gray-400 group-hover:text-white' />
					<span className='absolute top-3 right-3 size-2 bg-red-500 rounded-full border-2 border-[#0a0a0a]'></span>
				</button>

				<div className='flex items-center gap-3 pl-6 border-l border-white/10'>
					<div className='flex flex-col items-end'>
						<span className='text-white text-sm font-semibold'>
							Tiffany Michelle
						</span>
						<span className='text-gray-500 text-xs'>
							tiffany.m.sugiono@gmail.com
						</span>
					</div>
					<div className='size-10 rounded-full bg-linear-to-br from-yellow-400 to-orange-500 p-0.5'>
						<div className='w-full h-full rounded-full bg-gray-900 flex items-center justify-center overflow-hidden'>
							<img
								src='https://api.dicebear.com/7.x/avataaars/svg?seed=Tiffany'
								alt='Avatar'
								className='w-full h-full object-cover'
							/>
						</div>
					</div>
					<button className='ml-2 p-2 text-gray-400 hover:text-white transition-colors'>
						<LogOut className='size-5' />
					</button>
				</div>
			</div>
		</header>
	);
};
