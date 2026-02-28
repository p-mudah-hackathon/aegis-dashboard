import React, { useEffect, useRef } from 'react';
import { X, ShieldAlert } from 'lucide-react';
import { Log, Scenario } from '../types';

interface AttackResultModalProps {
	isOpen: boolean;
	onClose: () => void;
	scenario: Scenario | null;
	logs: Log[];
	isSimulating: boolean;
}

export const AttackResultModal: React.FC<AttackResultModalProps> = ({
	isOpen,
	onClose,
	scenario,
	logs,
	isSimulating,
}) => {
	const scrollRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [logs]);

	if (!isOpen || !scenario) return null;

	const getLogStyle = (type: Log['type']) => {
		switch (type) {
			case 'attack':
				return 'text-orange-400';
			case 'blocked':
				return 'text-red-500 font-bold';
			case 'success':
				return 'text-emerald-400 font-bold';
			default:
				return 'text-zinc-500';
		}
	};

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300'>
			<div className='bg-[#0a0a0a] border border-white/10 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[600px]'>
				<div className='px-6 py-4 border-b border-white/5 bg-zinc-900/50 flex items-center justify-between'>
					<div className='flex items-center gap-3'>
						<div
							className={`p-2 rounded-xl border bg-black ${scenario.borderColor} ${scenario.glowColor}`}
						>
							<scenario.icon size={20} className={`${scenario.color}`} />
						</div>
						<div>
							<h3 className='text-white font-bold'>
								{scenario.title} Analysis
							</h3>
							<p className='text-zinc-500 text-[10px] uppercase tracking-wider font-mono'>
								Simulation ID:{' '}
								{Math.random().toString(36).substring(7).toUpperCase()}
							</p>
						</div>
					</div>
					<button
						onClick={onClose}
						className='p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-500 hover:text-white'
					>
						<X size={20} />
					</button>
				</div>

				<div className='flex-1 overflow-hidden flex flex-col'>
					<div
						className='bg-black p-6 flex-1 overflow-y-auto font-mono text-[11px] space-y-2'
						ref={scrollRef}
					>
						{logs.map((log) => (
							<div
								key={log.id}
								className='animate-in slide-in-from-left-2 duration-200'
							>
								<div className='flex gap-4'>
									<span className='text-zinc-800 shrink-0 font-bold'>
										{log.timestamp}
									</span>
									<div className='flex flex-col gap-0.5 leading-relaxed'>
										<div className={getLogStyle(log.type)}>
											<span className='opacity-50 mr-2'>$</span>
											{log.type === 'blocked' && '>> [CRITICAL_DETECTION] '}
											{log.type === 'success' && '>> [PROBE_SUCCESS] '}
											{log.message}
										</div>
										{log.details && (
											<div className='text-zinc-600 opacity-70 ml-5 italic'>
												{log.details}
											</div>
										)}
									</div>
								</div>
							</div>
						))}
						{isSimulating && (
							<div className='flex items-center gap-2 text-red-500 animate-pulse'>
								<span className='opacity-50'>$</span>
								<span>ANALYZING_BEHAVIORAL_NODES...</span>
							</div>
						)}
					</div>
				</div>

				{!isSimulating && (
					<div className='p-6 bg-[#0d0d0d] border-t border-white/5 animate-in slide-in-from-bottom-4'>
						<div className='flex items-start gap-4'>
							<div className='p-3 bg-red-500/10 rounded-2xl'>
								<ShieldAlert className='text-red-500' size={24} />
							</div>
							<div className='flex-1'>
								<div className='flex items-center justify-between mb-2'>
									<span className='text-[10px] text-red-500 font-bold uppercase tracking-widest bg-red-500/10 px-2 py-0.5 rounded'>
										AEGIS_INTERCEPTED
									</span>
									<span className='text-[10px] text-zinc-500 font-mono'>
										Score: 0.99
									</span>
								</div>
								<h4 className='text-white font-bold text-sm mb-1'>
									Detection Logic:
								</h4>
								<p className='text-zinc-400 text-xs leading-relaxed'>
									{scenario.reason}
								</p>
							</div>
						</div>
						<button
							onClick={onClose}
							className='w-full mt-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors'
						>
							Dismiss Analysis
						</button>
					</div>
				)}
			</div>
		</div>
	);
};
