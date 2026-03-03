import React, { useState, useEffect } from 'react';
import { Smartphone, Skull, Sun, Moon } from 'lucide-react';
import { QRISPaymentView } from './components/QRISPaymentView';
import { AttackLogView } from './components/AttackLogView';

export const OperationSimulatorPage: React.FC = () => {
	const [currentView, setCurrentView] = useState<'user' | 'attacker'>('user');
	const [isDark, setIsDark] = useState(true);

	useEffect(() => {
		if (isDark) {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	}, [isDark]);

	return (
		<div className='flex-1 flex flex-col h-full bg-background overflow-hidden'>
			<div className='h-16 px-8 flex items-center justify-between border-b border-border-subtle bg-background'>
				<button
					onClick={() => setIsDark(!isDark)}
					className='p-2.5 rounded-xl bg-surface-2 border border-border-subtle text-text-muted hover:text-text-primary hover:bg-surface-3 transition-all duration-200'
					title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
				>
					{isDark ? <Sun size={16} /> : <Moon size={16} />}
				</button>

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

				{/* Spacer to balance the layout */}
				<div className='w-[36px]' />
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
