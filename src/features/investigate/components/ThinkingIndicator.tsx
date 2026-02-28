import React, { useState, useEffect } from 'react';
import { Loader2, Brain } from 'lucide-react';

const THINKING_STEPS = [
	'Reading transaction data...',
	'Analyzing risk patterns...',
	'Cross-referencing fraud signals...',
	'Generating detailed analysis...',
	'Composing response...',
];

export const ThinkingIndicator: React.FC = () => {
	const [elapsed, setElapsed] = useState(0);
	const [stepIdx, setStepIdx] = useState(0);

	useEffect(() => {
		const timer = setInterval(() => setElapsed((s) => s + 1), 1000);
		return () => clearInterval(timer);
	}, []);

	useEffect(() => {
		const stepTimer = setInterval(() => {
			setStepIdx((s) => Math.min(s + 1, THINKING_STEPS.length - 1));
		}, 3000);
		return () => clearInterval(stepTimer);
	}, []);

	return (
		<div className='flex gap-3'>
			<div className='shrink-0 size-8 rounded-xl bg-purple-muted border border-purple/30 flex items-center justify-center'>
				<Brain size={16} className='text-purple animate-pulse' />
			</div>
			<div className='bg-surface-2 border border-border-subtle rounded-2xl rounded-tl-md px-5 py-4 min-w-[300px]'>
				<div className='flex items-center justify-between mb-3'>
					<div className='flex items-center gap-2'>
						<Loader2 size={14} className='animate-spin text-primary' />
						<span className='text-xs font-bold text-text-secondary'>
							Qwen 3.5 Plus is thinking
						</span>
					</div>
					<span className='text-[11px] text-primary font-mono tabular-nums'>
						{elapsed}s
					</span>
				</div>
				<div className='space-y-1.5'>
					{THINKING_STEPS.slice(0, stepIdx + 1).map((step, i) => (
						<div key={i} className='flex items-center gap-2 text-[11px]'>
							{i < stepIdx ? (
								<span className='text-success'>✓</span>
							) : (
								<span className='size-3 rounded-full border border-primary/50 animate-pulse' />
							)}
							<span
								className={
									i < stepIdx ? 'text-text-muted' : 'text-text-secondary'
								}
							>
								{step}
							</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};
