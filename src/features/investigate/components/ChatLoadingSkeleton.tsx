import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

export const ChatLoadingSkeleton: React.FC = () => {
	return (
		<div
			className='flex-1 overflow-hidden px-8 py-6 space-y-6'
			style={{
				background:
					'radial-gradient(circle at 30% 20%, rgba(249,115,22,0.03) 0%, transparent 50%), #0a0a0a',
			}}
		>
			{/* Welcome banner skeleton */}
			<div className='flex gap-3 animate-in fade-in duration-500'>
				<div className='shrink-0 size-8 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center'>
					<Sparkles size={16} className='text-orange-400' />
				</div>
				<div className='bg-[#1e1e1e] border border-white/5 rounded-2xl rounded-tl-md px-5 py-4 min-w-[320px]'>
					<div className='flex items-center gap-2 mb-3'>
						<Loader2 size={14} className='animate-spin text-orange-400' />
						<span className='text-xs font-bold text-gray-300'>
							Loading conversation...
						</span>
					</div>
					<div className='space-y-2.5 animate-pulse'>
						<div className='h-3.5 bg-white/5 rounded-lg w-full' />
						<div className='h-3.5 bg-white/5 rounded-lg w-4/5' />
						<div className='h-3.5 bg-white/5 rounded-lg w-3/5' />
					</div>
				</div>
			</div>

			{/* User bubble skeleton */}
			<div className='flex gap-3 flex-row-reverse animate-pulse'>
				<div className='size-8 rounded-xl bg-blue-500/5 border border-blue-500/10 shrink-0' />
				<div className='bg-orange-500/5 border border-orange-500/10 rounded-2xl rounded-tr-md px-5 py-3'>
					<div className='space-y-2'>
						<div className='h-3.5 bg-orange-500/10 rounded-lg w-44' />
						<div className='h-3.5 bg-orange-500/10 rounded-lg w-28' />
					</div>
				</div>
			</div>

			{/* Bot response skeleton */}
			<div className='flex gap-3 animate-pulse'>
				<div className='size-8 rounded-xl bg-orange-500/5 border border-orange-500/10 shrink-0' />
				<div className='bg-[#1e1e1e] border border-white/5 rounded-2xl rounded-tl-md px-5 py-4 flex-1 max-w-[65%]'>
					<div className='space-y-2.5'>
						<div className='h-3.5 bg-white/5 rounded-lg w-full' />
						<div className='h-3.5 bg-white/5 rounded-lg w-5/6' />
						<div className='h-3.5 bg-white/5 rounded-lg w-full' />
						<div className='h-3.5 bg-white/5 rounded-lg w-2/3' />
					</div>
				</div>
			</div>

			{/* Another exchange */}
			<div className='flex gap-3 flex-row-reverse animate-pulse'>
				<div className='size-8 rounded-xl bg-blue-500/5 border border-blue-500/10 shrink-0' />
				<div className='bg-orange-500/5 border border-orange-500/10 rounded-2xl rounded-tr-md px-5 py-3'>
					<div className='h-3.5 bg-orange-500/10 rounded-lg w-36' />
				</div>
			</div>

			<div className='flex gap-3 animate-pulse'>
				<div className='size-8 rounded-xl bg-orange-500/5 border border-orange-500/10 shrink-0' />
				<div className='bg-[#1e1e1e] border border-white/5 rounded-2xl rounded-tl-md px-5 py-4 flex-1 max-w-[55%]'>
					<div className='space-y-2.5'>
						<div className='h-3.5 bg-white/5 rounded-lg w-full' />
						<div className='h-3.5 bg-white/5 rounded-lg w-3/4' />
					</div>
				</div>
			</div>
		</div>
	);
};
