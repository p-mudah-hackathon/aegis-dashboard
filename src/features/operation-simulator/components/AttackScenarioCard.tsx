import React from 'react';
import { Play } from 'lucide-react';
import { Scenario } from '../types';

interface AttackScenarioCardProps {
	scenario: Scenario;
	onClick: (scenario: Scenario) => void;
	disabled?: boolean;
}

export const AttackScenarioCard: React.FC<AttackScenarioCardProps> = ({
	scenario: s,
	onClick,
	disabled,
}) => {
	return (
		<button
			disabled={disabled}
			onClick={() => onClick(s)}
			className={`group relative w-full p-4 bg-[#0d0d0d] border border-white/5 rounded-2xl text-left transition-all duration-300 flex items-center gap-4 overflow-hidden ${
				disabled
					? 'opacity-50 cursor-not-allowed'
					: 'hover:border-white/20 hover:bg-[#121212] hover:translate-x-1'
			}`}
		>
			<div
				className={`absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500 ${s.accent}`}
			/>

			<div className='relative z-10 flex items-center justify-between w-full'>
				<div className='flex items-center gap-4'>
					<div
						className={`p-2 rounded-xl border bg-black transition-all duration-500 group-hover:scale-110 group-hover:bg-zinc-900 ${s.borderColor} ${s.glowColor} group-hover:border-opacity-100 group-hover:shadow-[0_0_15px_0px_rgba(255,255,255,0.05)]`}
					>
						<s.icon
							size={18}
							className={`${s.color} transition-all duration-500 group-hover:brightness-125 group-hover:stroke-[2.5px]`}
						/>
					</div>

					<div>
						<h3 className='text-white font-bold text-sm tracking-tight uppercase group-hover:text-white transition-colors'>
							{s.title}
						</h3>
						<p className='text-zinc-500 text-[10px] font-mono tracking-widest uppercase opacity-60'>
							Vector_ID: {s.id.slice(0, 8)}
						</p>
					</div>
				</div>

				<div className='flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0'>
					<span className='text-[8px] text-zinc-500 font-bold uppercase tracking-widest'>
						Simulate
					</span>
					<Play size={8} className='text-zinc-500 fill-current' />
				</div>
			</div>
			<div className='absolute -right-4 -bottom-4 opacity-[0.02] group-hover:opacity-[0.06] transition-all duration-700 pointer-events-none'>
				<s.icon
					size={80}
					className={`${s.color}`}
					style={{
						filter: `drop-shadow(0 0 8px currentColor)`,
					}}
				/>
			</div>
		</button>
	);
};
