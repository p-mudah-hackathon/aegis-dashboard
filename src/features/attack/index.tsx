import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
	Zap,
	Play,
	Square,
	History,
	AlertTriangle,
	ShieldCheck,
	ShieldX,
	Target,
	BarChart3,
	Loader2,
	ChevronDown,
	Skull,
	TrendingUp,
	Clock,
	Hash,
	Eye,
} from 'lucide-react';
import * as api from '../../api';

interface LiveStats {
	total: number;
	approved: number;
	flagged: number;
	tp: number;
	fp: number;
	tn: number;
	fn: number;
	recall: number;
	precision: number;
	f1: number;
	fpr: number;
	roi_saved: number;
	per_type: Record<string, number>;
	per_type_total: Record<string, number>;
}

interface LogEntry {
	id: number;
	level: string;
	text: string;
	time: Date;
}

const FRAUD_PRESETS = [
	{
		label: 'Light',
		pct: '5%',
		value: 0.05,
		color: 'text-success',
		bg: 'bg-success-muted border-success/20',
	},
	{
		label: 'Moderate',
		pct: '15%',
		value: 0.15,
		color: 'text-warning',
		bg: 'bg-warning-muted border-warning/20',
	},
	{
		label: 'Heavy',
		pct: '30%',
		value: 0.3,
		color: 'text-danger',
		bg: 'bg-danger-muted border-danger/20',
	},
	{
		label: 'Extreme',
		pct: '50%',
		value: 0.5,
		color: 'text-danger',
		bg: 'bg-danger-muted border-danger/20',
	},
];

export const AttackSimulatorPage: React.FC = () => {
	const [total, setTotal] = useState(200);
	const [fraudPct, setFraudPct] = useState(0.15);
	const [speed, setSpeed] = useState<'slow' | 'normal' | 'fast'>('fast');
	const [running, setRunning] = useState(false);
	const [completed, setCompleted] = useState(false);
	const [stats, setStats] = useState<LiveStats | null>(null);
	const [progress, setProgress] = useState(0);
	const [logs, setLogs] = useState<LogEntry[]>([]);
	const [recentTxns, setRecentTxns] = useState<any[]>([]);
	const [history, setHistory] = useState<api.AttackRun[]>([]);
	const [showHistory, setShowHistory] = useState(false);
	const [selectedRun, setSelectedRun] = useState<api.AttackRun | null>(null);
	const [elapsed, setElapsed] = useState(0);

	const wsRef = useRef<WebSocket | null>(null);
	const logIdRef = useRef(0);
	const logsEndRef = useRef<HTMLDivElement>(null);
	const timerRef = useRef<number | null>(null);

	useEffect(() => {
		logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [logs]);
	useEffect(() => {
		api
			.getAttackHistory(10)
			.then(setHistory)
			.catch(() => {});
	}, [completed]);

	useEffect(() => {
		if (running) {
			const start = Date.now();
			timerRef.current = window.setInterval(
				() => setElapsed(Math.floor((Date.now() - start) / 1000)),
				1000,
			);
		} else if (timerRef.current) {
			clearInterval(timerRef.current);
		}
		return () => {
			if (timerRef.current) clearInterval(timerRef.current);
		};
	}, [running]);

	const addLog = useCallback((level: string, text: string) => {
		setLogs((prev) => [
			...prev.slice(-300),
			{ id: logIdRef.current++, level, text, time: new Date() },
		]);
	}, []);

	const handleStart = useCallback(() => {
		const ws = new WebSocket(api.getAttackWsUrl());
		wsRef.current = ws;
		ws.onopen = () => {
			setRunning(true);
			setCompleted(false);
			setStats(null);
			setProgress(0);
			setLogs([]);
			setRecentTxns([]);
			setElapsed(0);
			setSelectedRun(null);
			addLog(
				'info',
				`⚔ Launching attack: ${total} transactions, ${(fraudPct * 100).toFixed(0)}% fraud, ${speed} speed`,
			);
			ws.send(JSON.stringify({ total, fraud_pct: fraudPct, speed }));
		};
		ws.onmessage = (ev) => {
			const event: api.AttackEvent = JSON.parse(ev.data);
			if (event.type === 'transaction') {
				setRecentTxns((prev) => [event.data, ...prev.slice(0, 99)]);
				setProgress((prev) => prev + 1);
			} else if (event.type === 'stats_update') {
				setStats(event.data);
			} else if (event.type === 'attack_start') {
				addLog(
					'info',
					`Simulation started: ${event.data.total} total, ${event.data.fraud} adversarial`,
				);
			} else if (event.type === 'attack_end') {
				setStats(event.data);
				setProgress(total);
				setRunning(false);
				setCompleted(true);
				addLog(
					'info',
					`✅ Complete — F1: ${(event.data.f1 * 100).toFixed(1)}% | Recall: ${(event.data.recall * 100).toFixed(1)}% | ROI: IDR ${event.data.roi_saved?.toLocaleString('id-ID') ?? 0}`,
				);
				ws.close();
			} else if (event.type === 'log') {
				addLog(event.level || 'info', event.text || '');
			}
		};
		ws.onerror = () => {
			addLog('error', 'WebSocket error — is the API running?');
			setRunning(false);
		};
		ws.onclose = () => setRunning(false);
	}, [total, fraudPct, speed, addLog]);

	const handleStop = useCallback(() => {
		wsRef.current?.close();
		wsRef.current = null;
		setRunning(false);
		addLog('warn', 'Stopped by user');
	}, [addLog]);

	const viewRun = (run: api.AttackRun) => {
		setSelectedRun(run);
		setShowHistory(false);
	};

	const pctDone = total > 0 ? Math.min(100, (progress / total) * 100) : 0;
	// Use selected run stats or live stats
	const displayStats = selectedRun ? (selectedRun as any as LiveStats) : stats;

	return (
		<div
			className='flex-1 overflow-y-auto transition-colors duration-300'
			style={{
				background:
					'radial-gradient(circle at 50% 0%, var(--sem-danger-muted, rgba(239,68,68,0.04)) 0%, transparent 50%), var(--background)',
			}}
		>
			<div className='max-w-7xl mx-auto px-8 py-8 space-y-6'>
				{/* Header */}
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-4'>
						<div className='size-12 rounded-2xl bg-danger-muted border border-danger/30 flex items-center justify-center'>
							<Skull size={24} className='text-danger' />
						</div>
						<div>
							<h1 className='text-text-primary text-2xl font-bold'>
								Attack Simulator
							</h1>
							<p className='text-text-muted text-sm'>
								Test HTGNN model resilience against adversarial QRIS fraud
								patterns
							</p>
						</div>
					</div>
					<div className='flex items-center gap-3'>
						{selectedRun && (
							<button
								onClick={() => setSelectedRun(null)}
								className='px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary hover:bg-primary/20 transition-colors'
							>
								← Back to Live
							</button>
						)}
						<button
							onClick={() => setShowHistory(!showHistory)}
							className='flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm text-text-muted hover:bg-surface-2 transition-colors'
						>
							<History size={14} />
							History ({history.length})
							<ChevronDown
								size={12}
								className={`transition-transform ${showHistory ? 'rotate-180' : ''}`}
							/>
						</button>
					</div>
				</div>

				{/* Selected Run Banner */}
				{selectedRun && (
					<div className='bg-info-muted border border-info/20 rounded-2xl px-5 py-3 flex items-center gap-3'>
						<Eye size={16} className='text-info' />
						<span className='text-sm text-text-secondary'>
							Viewing past run #{selectedRun.id} — {selectedRun.total_txns}{' '}
							txns, {(selectedRun.fraud_pct * 100).toFixed(0)}% fraud
						</span>
						<span className='text-xs text-text-muted/60 ml-auto'>
							{selectedRun.started_at
								? new Date(selectedRun.started_at).toLocaleString('id-ID')
								: ''}
						</span>
					</div>
				)}

				{/* History Panel */}
				{showHistory && (
					<div className='bg-surface-2 border border-border-subtle rounded-2xl p-5'>
						<h3 className='text-sm font-bold text-text-secondary mb-3'>
							Past Simulation Runs
						</h3>
						{history.length === 0 ? (
							<p className='text-text-muted text-xs text-center py-4'>
								No past runs yet. Launch your first attack!
							</p>
						) : (
							<div className='space-y-2'>
								{history.map((run) => (
									<button
										key={run.id}
										onClick={() => viewRun(run)}
										className='w-full flex items-center gap-4 p-4 bg-surface-1 rounded-xl text-xs hover:bg-surface-elevated transition-all text-left group border border-transparent hover:border-primary/20'
									>
										<span className='text-text-muted font-mono'>#{run.id}</span>
										<span
											className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${run.status === 'completed' ? 'bg-success-muted text-success' : 'bg-warning-muted text-warning'}`}
										>
											{run.status}
										</span>
										<span className='text-gray-300 font-medium'>
											{run.total_txns} txns
										</span>
										<span className='text-gray-500'>
											{(run.fraud_pct * 100).toFixed(0)}% fraud
										</span>
										<div className='ml-auto flex items-center gap-6'>
											<div className='text-right'>
												<p className='text-primary font-bold'>
													F1: {(run.f1 * 100).toFixed(1)}%
												</p>
												<p className='text-text-muted text-[10px]'>
													Recall: {(run.recall * 100).toFixed(1)}%
												</p>
											</div>
											<div className='text-right'>
												<p className='text-success font-bold'>
													IDR {run.roi_saved.toLocaleString('id-ID')}
												</p>
												<p className='text-text-muted text-[10px]'>saved</p>
											</div>
											<span className='text-text-muted group-hover:text-primary transition-colors'>
												View →
											</span>
										</div>
									</button>
								))}
							</div>
						)}
					</div>
				)}

				<div className='grid grid-cols-12 gap-6'>
					{/* Config Panel */}
					<div className='col-span-3 bg-surface-2 border border-border-subtle rounded-2xl p-5 space-y-5'>
						<h2 className='text-text-primary font-bold text-sm flex items-center gap-2'>
							<Zap size={14} className='text-danger' />
							Configuration
						</h2>
						<div>
							<label className='text-[10px] text-gray-500 uppercase tracking-wider mb-2 block'>
								Transactions
							</label>
							<input
								type='range'
								min={50}
								max={2000}
								step={50}
								value={total}
								onChange={(e) => setTotal(Number(e.target.value))}
								disabled={running}
								className='w-full accent-red-500'
							/>
							<p className='text-center text-danger font-bold text-lg mt-1'>
								{total}
							</p>
						</div>
						<div>
							<label className='text-[10px] text-gray-500 uppercase tracking-wider mb-2 block'>
								Fraud Ratio
							</label>
							<div className='grid grid-cols-2 gap-1.5'>
								{FRAUD_PRESETS.map((p) => (
									<button
										key={p.value}
										onClick={() => setFraudPct(p.value)}
										disabled={running}
										className={`px-2 py-2 rounded-lg text-[11px] font-medium transition-all border ${fraudPct === p.value ? `${p.bg} ${p.color}` : 'bg-surface-3 text-text-muted border-border-subtle hover:bg-surface-elevated'}`}
									>
										{p.label}
										<br />
										<span className='font-bold'>{p.pct}</span>
									</button>
								))}
							</div>
						</div>
						<div>
							<label className='text-[10px] text-gray-500 uppercase tracking-wider mb-2 block'>
								Speed
							</label>
							<div className='flex gap-1.5'>
								{['slow', 'normal', 'fast'].map((s) => (
									<button
										key={s}
										onClick={() => setSpeed(s as any)}
										disabled={running}
										className={`flex-1 py-2 rounded-lg text-[11px] font-medium transition-all ${speed === s ? 'bg-primary-muted text-primary border border-primary/30' : 'bg-surface-3 text-text-muted border border-border-subtle'}`}
									>
										{s.charAt(0).toUpperCase() + s.slice(1)}
									</button>
								))}
							</div>
						</div>
						<button
							onClick={running ? handleStop : handleStart}
							className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
								running
									? 'bg-danger-muted text-danger border border-danger/30 hover:bg-danger/20'
									: 'bg-linear-to-r from-danger to-primary text-white hover:shadow-lg hover:shadow-danger/20'
							}`}
						>
							{running ? (
								<>
									<Square size={14} /> Stop
								</>
							) : (
								<>
									<Play size={14} /> Launch Attack
								</>
							)}
						</button>
						{(running || progress > 0) && (
							<div>
								<div className='flex justify-between text-[10px] text-gray-500 mb-1'>
									<span>
										{progress}/{total}
									</span>
									<span>{pctDone.toFixed(0)}%</span>
								</div>
								<div className='h-1.5 bg-surface-3 rounded-full overflow-hidden'>
									<div
										className='h-full bg-linear-to-r from-danger to-primary rounded-full transition-all'
										style={{ width: `${pctDone}%` }}
									/>
								</div>
								{running && (
									<p className='text-[10px] text-text-muted mt-1 text-center'>
										<Clock size={10} className='inline mr-1' />
										{elapsed}s elapsed
									</p>
								)}
							</div>
						)}
					</div>

					{/* Right: Metrics Dashboard */}
					<div className='col-span-9 space-y-5'>
						{/* Top metrics row */}
						<div className='grid grid-cols-5 gap-3'>
							<MetricBox
								label='Recall'
								value={displayStats?.recall ?? 0}
								icon={<Target size={14} />}
								color='blue'
								desc='Fraud caught'
							/>
							<MetricBox
								label='Precision'
								value={displayStats?.precision ?? 0}
								icon={<ShieldCheck size={14} />}
								color='green'
								desc='Flag accuracy'
							/>
							<MetricBox
								label='F1 Score'
								value={displayStats?.f1 ?? 0}
								icon={<TrendingUp size={14} />}
								color='orange'
								desc='Overall score'
							/>
							<MetricBox
								label='FPR'
								value={displayStats?.fpr ?? 0}
								icon={<AlertTriangle size={14} />}
								color='red'
								desc='False alarms'
								inverted
							/>
							<div className='bg-surface-2 border border-border-subtle rounded-2xl p-4 text-center'>
								<p className='text-[10px] text-text-muted mb-1'>ROI Saved</p>
								<p className='text-lg font-bold text-success'>
									IDR {((displayStats?.roi_saved ?? 0) / 1000).toFixed(0)}K
								</p>
								<p className='text-[9px] text-text-muted'>fraud blocked</p>
							</div>
						</div>

						{/* Confusion Matrix + Per-Type Breakdown */}
						<div className='grid grid-cols-2 gap-5'>
							{/* Confusion Matrix */}
							<div className='bg-surface-2 border border-border-subtle rounded-2xl p-5'>
								<h3 className='text-sm font-bold text-text-secondary mb-3 flex items-center gap-2'>
									<BarChart3 size={14} className='text-primary' />
									Confusion Matrix
									{running && (
										<Loader2
											size={12}
											className='animate-spin text-primary ml-auto'
										/>
									)}
								</h3>
								<div className='grid grid-cols-3 gap-0 text-center text-[11px]'>
									{/* Header row */}
									<div />
									<div className='p-2 text-text-muted font-bold'>
										Predicted +
									</div>
									<div className='p-2 text-text-muted font-bold'>
										Predicted −
									</div>
									{/* Actual Fraud row */}
									<div className='p-2 text-text-muted font-bold text-right pr-3'>
										Actual Fraud
									</div>
									<div className='p-3 m-0.5 rounded-lg bg-success-muted border border-success/20'>
										<p className='text-2xl font-bold text-success'>
											{displayStats?.tp ?? 0}
										</p>
										<p className='text-[9px] text-success/60'>TP</p>
									</div>
									<div className='p-3 m-0.5 rounded-lg bg-warning-muted border border-warning/20'>
										<p className='text-2xl font-bold text-warning'>
											{displayStats?.fn ?? 0}
										</p>
										<p className='text-[9px] text-warning/60'>FN — Missed</p>
									</div>
									{/* Actual Legit row */}
									<div className='p-2 text-text-muted font-bold text-right pr-3'>
										Actual Legit
									</div>
									<div className='p-3 m-0.5 rounded-lg bg-danger-muted border border-danger/20'>
										<p className='text-2xl font-bold text-danger'>
											{displayStats?.fp ?? 0}
										</p>
										<p className='text-[9px] text-danger/60'>
											FP — False alarm
										</p>
									</div>
									<div className='p-3 m-0.5 rounded-lg bg-info-muted border border-info/20'>
										<p className='text-2xl font-bold text-info'>
											{displayStats?.tn ?? 0}
										</p>
										<p className='text-[9px] text-info/60'>TN</p>
									</div>
								</div>
								<div className='mt-3 grid grid-cols-3 gap-2 text-[10px]'>
									<div className='text-center p-2 rounded-lg bg-white/2'>
										<span className='text-text-muted'>Total</span>
										<p className='text-text-primary font-bold'>
											{displayStats?.total ?? 0}
										</p>
									</div>
									<div className='text-center p-2 rounded-lg bg-white/2'>
										<span className='text-text-muted'>Flagged</span>
										<p className='text-primary font-bold'>
											{displayStats?.flagged ?? 0}
										</p>
									</div>
									<div className='text-center p-2 rounded-lg bg-white/2'>
										<span className='text-text-muted'>Approved</span>
										<p className='text-success font-bold'>
											{displayStats?.approved ?? 0}
										</p>
									</div>
								</div>
							</div>

							{/* Per Fraud Type Breakdown */}
							<div className='bg-surface-2 border border-border-subtle rounded-2xl p-5'>
								<h3 className='text-sm font-bold text-text-secondary mb-3 flex items-center gap-2'>
									<Hash size={14} className='text-purple' />
									Detection by Fraud Type
								</h3>
								{displayStats?.per_type &&
								Object.keys(displayStats.per_type).length > 0 ? (
									<div className='space-y-3'>
										{Object.entries(
											displayStats.per_type_total ?? displayStats.per_type,
										).map(([type, totalCount]) => {
											const detected = displayStats.per_type?.[type] ?? 0;
											const rate =
												totalCount > 0 ? (detected / totalCount) * 100 : 0;
											return (
												<div key={type}>
													<div className='flex justify-between text-[11px] mb-1'>
														<span className='text-text-secondary capitalize'>
															{type.replace(/_/g, ' ')}
														</span>
														<span className='text-text-muted'>
															{detected}/{totalCount} caught ({rate.toFixed(0)}
															%)
														</span>
													</div>
													<div className='h-2 bg-surface-3 rounded-full overflow-hidden'>
														<div
															className='h-full bg-linear-to-r from-purple to-pink rounded-full transition-all'
															style={{ width: `${rate}%` }}
														/>
													</div>
												</div>
											);
										})}
									</div>
								) : (
									<div className='text-text-muted text-xs text-center py-8'>
										{running
											? 'Collecting data...'
											: 'Launch an attack to see per-type breakdown'}
									</div>
								)}
							</div>
						</div>

						{/* Live Feed + Logs */}
						<div className='grid grid-cols-2 gap-5'>
							<div className='bg-surface-2 border border-border-subtle rounded-2xl p-5'>
								<h3 className='text-sm font-bold text-text-secondary mb-3 flex items-center gap-2'>
									<ShieldX size={14} className='text-danger' />
									Live Transaction Feed
									{running && (
										<span className='ml-auto size-2 rounded-full bg-danger animate-pulse' />
									)}
								</h3>
								<div
									className='space-y-1 max-h-48 overflow-y-auto'
									style={{ scrollbarWidth: 'none' }}
								>
									{recentTxns.length === 0 ? (
										<p className='text-text-muted text-xs text-center py-6'>
											Waiting for transactions...
										</p>
									) : (
										recentTxns.slice(0, 30).map((txn, i) => (
											<div
												key={i}
												className='flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-surface-1 text-[11px]'
											>
												<span
													className={`font-mono ${txn.is_fraud ? 'text-danger' : 'text-text-muted'}`}
												>
													{txn.txn_id}
												</span>
												<span className='text-text-muted truncate max-w-[80px]'>
													{txn.merchant}
												</span>
												<span className='text-text-secondary ml-auto'>
													{((txn.risk_score ?? 0) * 100).toFixed(0)}%
												</span>
												{txn.is_flagged ? (
													<span className='px-1 py-0.5 rounded text-[8px] bg-danger-muted text-danger font-bold'>
														FLAG
													</span>
												) : (
													<span className='px-1 py-0.5 rounded text-[8px] bg-success-muted text-success'>
														OK
													</span>
												)}
												{txn.fraud_type && (
													<span className='px-1 py-0.5 rounded text-[8px] bg-purple-muted text-purple'>
														{txn.fraud_type.replace(/_/g, ' ')}
													</span>
												)}
											</div>
										))
									)}
								</div>
							</div>
							<div className='bg-surface-2 border border-border-subtle rounded-2xl p-5'>
								<h3 className='text-sm font-bold text-text-secondary mb-3'>
									Simulation Log
								</h3>
								<div
									className='space-y-0.5 max-h-48 overflow-y-auto font-mono text-[10px]'
									style={{ scrollbarWidth: 'none' }}
								>
									{logs.length === 0 ? (
										<p className='text-text-muted text-xs text-center py-6 font-sans'>
											Ready
										</p>
									) : (
										logs.map((log) => (
											<div key={log.id} className='flex gap-2'>
												<span className='text-text-muted shrink-0'>
													{log.time.toLocaleTimeString('id-ID', {
														hour: '2-digit',
														minute: '2-digit',
														second: '2-digit',
													})}
												</span>
												<span
													className={
														log.level === 'error'
															? 'text-danger'
															: log.level === 'warn'
																? 'text-warning'
																: 'text-text-muted'
													}
												>
													{log.text}
												</span>
											</div>
										))
									)}
									<div ref={logsEndRef} />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

const MetricBox: React.FC<{
	label: string;
	value: number;
	icon: React.ReactNode;
	color: string;
	desc: string;
	inverted?: boolean;
}> = ({ label, value, icon, color, desc }) => {
	const pct = (value * 100).toFixed(1);
	const colors: Record<string, string> = {
		blue: 'text-info',
		green: 'text-success',
		orange: 'text-primary',
		red: 'text-danger',
	};
	const bgs: Record<string, string> = {
		blue: 'bg-info-muted border-info/10',
		green: 'bg-success-muted border-success/10',
		orange: 'bg-primary-muted border-primary/10',
		red: 'bg-danger-muted border-danger/10',
	};
	return (
		<div className={`rounded-2xl border p-4 text-center ${bgs[color]}`}>
			<div
				className={`flex items-center justify-center gap-1.5 mb-1 ${colors[color]}`}
			>
				{icon}
				<span className='text-[10px] opacity-60'>{label}</span>
			</div>
			<p className={`text-xl font-bold ${colors[color]}`}>{pct}%</p>
			<p className='text-[9px] text-text-muted'>{desc}</p>
		</div>
	);
};
