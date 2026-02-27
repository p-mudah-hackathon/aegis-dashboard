import React, { useEffect, useRef } from 'react';
import { Log } from '../types';

interface HackerTerminalProps {
	logs: Log[];
	isSimulating?: boolean;
}

export const HackerTerminal: React.FC<HackerTerminalProps> = ({
	logs,
	isSimulating,
}) => {
	const scrollRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [logs]);

	const getLogStyle = (type: Log['type']) => {
		switch (type) {
			case 'attack':
				return 'text-orange-400';
			case 'blocked':
				return 'text-red-500 font-bold';
			case 'success':
				return 'text-emerald-400 font-bold';
			default:
				return 'text-zinc-600';
		}
	};

	return (
		<div className='flex-1 bg-[#050505] border border-white/5 rounded-3xl overflow-hidden flex flex-col shadow-2xl relative'>
			<div className='px-6 py-3 border-b border-white/5 bg-zinc-900/30 flex items-center justify-between'>
				<div className='flex items-center gap-2'>
					<div className='flex gap-1.5'>
						<div className='size-2.5 rounded-full bg-red-500/20 border border-red-500/40' />
						<div className='size-2.5 rounded-full bg-amber-500/20 border border-amber-500/40' />
						<div className='size-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/40' />
					</div>
					<span className='ml-2 text-[10px] font-mono text-zinc-500 uppercase tracking-widest'>
						PAYLOAD.ATTACKER.SHELL
					</span>
				</div>
				<div className='flex items-center gap-4 text-[9px] font-mono text-zinc-600 uppercase'>
					<span>Session: Active</span>
					<span className='size-1.5 rounded-full bg-emerald-500 animate-pulse' />
				</div>
			</div>

			<div
				className='flex-1 p-8 overflow-y-auto font-mono text-[11px] space-y-3 custom-scrollbar'
				ref={scrollRef}
			>
				{logs.length === 0 && (
					<div className='text-zinc-800 animate-pulse'>
						[SYSTEM] WAITING_FOR_PAYLOAD_EXECUTION...
					</div>
				)}
				{logs.map((log) => (
					<div
						key={log.id}
						className='animate-in slide-in-from-left-2 duration-300'
					>
						<div className='flex gap-4'>
							<span className='text-zinc-800 shrink-0 font-bold'>
								[{log.timestamp}]
							</span>
							<div className='flex flex-col gap-1 leading-relaxed shadow-sm'>
								<div className={getLogStyle(log.type)}>
									<span className='opacity-30 mr-2'>$</span>
									{log.type === 'blocked' && '>> [DETECTION_EVENT] '}
									{log.type === 'success' && '>> [PAYLOAD_SUCCESS] '}
									{log.message}
								</div>
								{log.details && (
									<div className='text-zinc-700 opacity-60 ml-5 italic text-[10px]'>
										{log.details}
									</div>
								)}
							</div>
						</div>
					</div>
				))}
				{isSimulating && (
					<div className='flex items-center gap-2 text-red-500/80 animate-pulse'>
						<span className='opacity-30 font-mono'>$</span>
						<span className='text-[10px]'>EXECUTING_ADVERSARIAL_VECTOR...</span>
					</div>
				)}
			</div>
			<div className='absolute inset-0 pointer-events-none bg-gradient-to-t from-red-500/5 to-transparent opacity-20' />
		</div>
	);
};
