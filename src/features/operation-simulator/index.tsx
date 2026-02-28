import React, { useState } from 'react';
import { Smartphone, Skull } from 'lucide-react';
import { QRISPaymentView } from './components/QRISPaymentView';
import { AttackLogView } from './components/AttackLogView';

export const OperationSimulatorPage: React.FC = () => {
	const [currentView, setCurrentView] = useState<'user' | 'attacker'>('user');

	return (
		<div className='flex-1 flex flex-col h-full bg-background overflow-hidden'>
			{/* Clean Header with Subtle Role Switcher */}
			<div className='h-16 px-8 flex items-center justify-center border-b border-border-subtle bg-background'>
				{/* <div className='flex items-center gap-3'>
					<ShieldCheck className='text-primary' size={20} />
					<div className='flex flex-col'>
						<span className='text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-bold leading-none'>
							Live Demo
						</span>
						<span className='text-xs text-white font-bold'>
							Paylabs Ecosystem
						</span>
					</div>
				</div> */}

				<div className='flex bg-surface-2 p-1 rounded-xl border border-border-subtle'>
					<button
						onClick={() => setCurrentView('user')}
						className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
							currentView === 'user'
								? 'bg-primary text-white shadow-lg shadow-primary/20'
								: 'text-text-muted hover:text-text-primary'
						}`}
					>
						<Smartphone size={14} />
						Victim (User)
					</button>
					<button
						onClick={() => setCurrentView('attacker')}
						className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
							currentView === 'attacker'
								? 'bg-danger text-white shadow-lg shadow-danger/20'
								: 'text-text-muted hover:text-text-primary'
						}`}
					>
						<Skull size={14} />
						Adversary (Attacker)
					</button>
				</div>

				{/* <div className='flex items-center gap-2'>
					<div className='size-2 bg-primary rounded-full animate-pulse' />
					<span className='text-[10px] text-zinc-500 uppercase font-bold tracking-widest'>
						Active Demo
					</span>
				</div> */}
			</div>

			{/* Main Content Area */}
			<div className='flex-1 p-8 overflow-y-auto bg-background/50'>
				<div className='max-w-6xl mx-auto'>
					{currentView === 'user' ? (
						<div className='animate-in fade-in slide-in-from-bottom-4 duration-500'>
							<QRISPaymentView
								onPaymentSuccess={(details) => {
									console.log('Payment sent to backend:', details);
								}}
							/>
						</div>
					) : (
						<div className='animate-in fade-in slide-in-from-bottom-4 duration-500'>
							<AttackLogView />
						</div>
					)}
				</div>
			</div>
		</div>
	);
};
