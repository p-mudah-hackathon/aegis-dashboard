import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Log } from '../types';
import {
	Zap,
	CreditCard,
	Globe,
	Activity,
	Layers,
	ShieldAlert,
	ChevronRight,
	Terminal,
	Play,
	Square,
	ShieldX,
	Loader2,
	Clock,
	Hash,
} from 'lucide-react';
import * as api from '../../../api';

interface Scenario {
	id: string;
	icon: React.ElementType;
	title: string;
	description: string;
	reason: string;
	color: string;
	borderColor: string;
	glowColor: string;
	accent: string;
	logs: { type: Log['type']; message: string; details?: string }[];
}

interface SimLogEntry {
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

const getFraudTypeStyle = (type: string) => {
	switch (type.toLowerCase()) {
		case 'velocity_attack':
			return 'bg-purple-muted text-purple';
		case 'card_testing':
			return 'bg-cyan-muted text-cyan';
		case 'collusion_ring':
			return 'bg-pink-muted text-pink';
		case 'geo_anomaly':
			return 'bg-warning-muted text-warning';
		case 'amount_anomaly':
			return 'bg-danger-muted text-danger';
		default:
			return 'bg-surface-3 text-text-muted';
	}
};

export const AttackLogView: React.FC = () => {
	const [logs, setLogs] = useState<Log[]>([]);
	const [isSimulating, setIsSimulating] = useState(false);
	const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(
		null,
	);
	const scrollRef = useRef<HTMLDivElement>(null);

	// ── Attack Simulator State ───────────────────────────────────────
	const [total, setTotal] = useState(200);
	const [fraudPct, setFraudPct] = useState(0.15);
	const [speed, setSpeed] = useState<'slow' | 'normal' | 'fast'>('fast');
	const [atkRunning, setAtkRunning] = useState(false);
	const [atkProgress, setAtkProgress] = useState(0);
	const [atkElapsed, setAtkElapsed] = useState(0);
	const [simLogs, setSimLogs] = useState<SimLogEntry[]>([]);
	const [recentTxns, setRecentTxns] = useState<any[]>([]);
	const [atkStats, setAtkStats] = useState<any>(null);

	const wsRef = useRef<WebSocket | null>(null);
	const simLogIdRef = useRef(0);
	const simLogsEndRef = useRef<HTMLDivElement>(null);
	const timerRef = useRef<number | null>(null);

	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [logs]);

	useEffect(() => {
		simLogsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [simLogs]);

	useEffect(() => {
		if (atkRunning) {
			const start = Date.now();
			timerRef.current = window.setInterval(
				() => setAtkElapsed(Math.floor((Date.now() - start) / 1000)),
				1000,
			);
		} else if (timerRef.current) {
			clearInterval(timerRef.current);
		}
		return () => {
			if (timerRef.current) clearInterval(timerRef.current);
		};
	}, [atkRunning]);

	const addSimLog = useCallback((level: string, text: string) => {
		setSimLogs((prev) => [
			...prev.slice(-300),
			{ id: simLogIdRef.current++, level, text, time: new Date() },
		]);
	}, []);

	const handleAtkStart = useCallback(() => {
		const ws = new WebSocket(api.getAttackWsUrl());
		wsRef.current = ws;
		ws.onopen = () => {
			setAtkRunning(true);
			setAtkProgress(0);
			setSimLogs([]);
			setRecentTxns([]);
			setAtkElapsed(0);
			setAtkStats(null);
			addSimLog(
				'info',
				`⚔ Launching attack: ${total} transactions, ${(fraudPct * 100).toFixed(0)}% fraud, ${speed} speed`,
			);
			ws.send(JSON.stringify({ total, fraud_pct: fraudPct, speed }));
		};
		ws.onmessage = (ev) => {
			const event: api.AttackEvent = JSON.parse(ev.data);
			if (event.type === 'transaction') {
				setRecentTxns((prev) => [event.data, ...prev.slice(0, 99)]);
				setAtkProgress((prev) => prev + 1);
			} else if (event.type === 'stats_update') {
				setAtkStats(event.data);
			} else if (event.type === 'attack_start') {
				addSimLog(
					'info',
					`Simulation started: ${event.data.total} total, ${event.data.fraud} adversarial`,
				);
			} else if (event.type === 'attack_end') {
				setAtkStats(event.data);
				setAtkProgress(total);
				setAtkRunning(false);
				addSimLog(
					'info',
					`✅ Complete — F1: ${(event.data.f1 * 100).toFixed(1)}% | Recall: ${(event.data.recall * 100).toFixed(1)}% | ROI: IDR ${event.data.roi_saved?.toLocaleString('id-ID') ?? 0}`,
				);
				ws.close();
			} else if (event.type === 'log') {
				addSimLog(event.level || 'info', event.text || '');
			}
		};
		ws.onerror = () => {
			addSimLog('error', 'WebSocket error — is the API running?');
			setAtkRunning(false);
		};
		ws.onclose = () => setAtkRunning(false);
	}, [total, fraudPct, speed, addSimLog]);

	const handleAtkStop = useCallback(() => {
		wsRef.current?.close();
		wsRef.current = null;
		setAtkRunning(false);
		addSimLog('warn', 'Stopped by user');
	}, [addSimLog]);

	const pctDone = total > 0 ? Math.min(100, (atkProgress / total) * 100) : 0;

	const scenarios: Scenario[] = [
		{
			id: 'velocity_attack',
			icon: Zap,
			title: 'Velocity Attack',
			description:
				'Compromised foreign e-wallet scans 10+ Paylabs dynamic QRIS codes across Bali and Jakarta in under 3 minutes.',
			reason:
				'Abnormal transaction density: 12 scans/180s from unique Geo-ID cluster.',
			color: 'text-purple',
			borderColor: 'border-purple/20',
			glowColor: 'shadow-[0_0_15px_-3px_rgba(168,85,247,0.2)]',
			accent: 'bg-purple',
			logs: [
				{
					type: 'system',
					message: 'REQUEST_POST: /api/v1/payment/process',
				},
				{
					type: 'system',
					message:
						'PAYLOAD: { type: "Velocity Attack", src_ip: "103.42.11.246" }',
				},
				{
					type: 'attack',
					message: 'Executing adversarial vector: Velocity Attack...',
					details: 'AgentID: A5-7429 (Kali-Linux-Container)',
				},
				{
					type: 'system',
					message: 'SCAN_INIT: QRIS_DYNAMIC_PAYLABS_0821',
				},
				{
					type: 'system',
					message: 'SCAN_INIT: QRIS_DYNAMIC_PAYLABS_0822',
				},
			],
		},
		{
			id: 'card_testing',
			icon: CreditCard,
			title: 'Card Testing',
			description:
				'Bot probes with tiny QRIS scans (Rp 10K) to verify inbound tourist wallet status.',
			reason:
				'Probing behavior detected: Micropayment verification followed by high-value outlier.',
			color: 'text-cyan',
			borderColor: 'border-cyan/20',
			glowColor: 'shadow-[0_0_15px_-3px_rgba(34,211,238,0.2)]',
			accent: 'bg-cyan',
			logs: [
				{
					type: 'system',
					message: 'TXN_REQ: IDR 10,000.00 (Status Check)',
				},
				{ type: 'success', message: 'PROBE_COMPLETE: Wallet Active' },
				{
					type: 'attack',
					message: 'EXEC_CASH_OUT: IDR 5,450,000.00',
					details: 'Target: Shadow-Merchant-ID-99',
				},
			],
		},
		{
			id: 'collusion_ring',
			icon: Layers,
			title: 'Collusion Ring',
			description:
				'3–5 synthetic foreign accounts sharing the same VPN IP subnet simultaneously routing high-value QRIS payments.',
			reason:
				'Sybil cluster detected: 5 accounts mapped to 103.42.11.x subnet routing to Merchant_ID_442.',
			color: 'text-pink',
			borderColor: 'border-pink/20',
			glowColor: 'shadow-[0_0_15px_-3px_rgba(244,114,182,0.2)]',
			accent: 'bg-pink',
			logs: [
				{
					type: 'system',
					message: 'INBOUND_CONN: 103.42.11.4 [VPN_DETECTED]',
				},
				{
					type: 'system',
					message: 'INBOUND_CONN: 103.42.11.8 [VPN_DETECTED]',
				},
				{
					type: 'attack',
					message: 'RING_SYNC: Synchronized high-value deposit',
					details: 'Merchant: "Local_Premium_F&B"',
				},
			],
		},
		{
			id: 'geo_anomaly',
			icon: Globe,
			title: 'Geo Anomaly',
			description:
				'Same Alipay/WeChat account scans QRIS in Jakarta and Bali 10 minutes apart.',
			reason:
				'Impossible travel: Speed 600km/h detected between nodes. Flagged as Account Takeover.',
			color: 'text-warning',
			borderColor: 'border-warning/30',
			glowColor: 'shadow-[0_0_15px_rgba(245,158,11,0.15)]',
			accent: 'bg-warning',
			logs: [
				{ type: 'system', message: 'TXN_LOC: Jakarta (S-Node-01)' },
				{
					type: 'attack',
					message: 'TOKEN_REUSE: Session pulse detected in Bali',
					details: 'Delta: 600 seconds',
				},
				{
					type: 'system',
					message: 'VALIDATING_GPS_FENCE: Hardware mismatch',
				},
			],
		},
		{
			id: 'amount_anomaly',
			icon: Activity,
			title: 'Amount Anomaly',
			description:
				'Rp 5M+ cross-border QRIS settlement at 3 AM on a small merchant that normally processes Rp 50K daily average.',
			reason:
				'Off-hours anomaly: High-value settlement outside operating window for SmallBusiness_Tier.',
			color: 'text-danger',
			borderColor: 'border-danger/30',
			glowColor: 'shadow-[0_0_15px_rgba(239,68,68,0.15)]',
			accent: 'bg-danger',
			logs: [
				{
					type: 'system',
					message: 'SETTLEMENT_REQ: IDR 5,200,000.00',
				},
				{
					type: 'system',
					message: 'TIME_SCAN: 03:14:22 [OFF_HOURS]',
				},
				{
					type: 'attack',
					message: 'PEER_P2P_EXPLOIT: Unusual merchant volume',
					details: 'Avg: 50,000 | Current: 5,200,000',
				},
			],
		},
	];

	const addLog = (type: Log['type'], message: string, details?: string) => {
		const newLog: Log = {
			id: Date.now() + Math.random(),
			type,
			message,
			timestamp: new Date().toLocaleTimeString(),
			details,
		};
		setLogs((prev) => [...prev, newLog]);
	};

	const runScenario = (scenario: Scenario) => {
		if (isSimulating) return;
		setSelectedScenario(scenario);
		setIsSimulating(true);
		setLogs([]);

		addLog('system', `REQUEST_POST: /api/v1/payment/process`);
		addLog(
			'system',
			`PAYLOAD: { type: "${scenario.title}", src_ip: "103.42.11.246" }`,
		);

		let delay = 600;
		scenario.logs.forEach((l) => {
			setTimeout(() => {
				addLog(l.type, l.message, l.details);
			}, delay);
			delay += 800;
		});

		setTimeout(() => {
			addLog(
				'blocked',
				`AEGIS_EVENT: HIGH_RISK_DETECTED`,
				`Logic: ${scenario.reason} Risk Score: 0.99`,
			);
			addLog('system', `GATEWAY_RESPONSE: TRANSACTION_SHIELDED`);
			addLog('system', `Action: TERMINATED`);
			setIsSimulating(false);
		}, delay + 400);
	};

	const getLogStyle = (type: Log['type']) => {
		switch (type) {
			case 'attack':
				return 'text-success';
			case 'blocked':
				return 'text-danger font-bold';
			case 'success':
				return 'text-success font-bold';
			default:
				return 'text-text-secondary';
		}
	};

	const getLogPrefix = (type: Log['type']) => {
		switch (type) {
			case 'attack':
				return '⚡ ';
			case 'blocked':
				return '⚠ AEGIS_EVENT: ';
			default:
				return '';
		}
	};

	return (
		<div className='animate-in fade-in duration-700 space-y-6'>
			{/* ── Existing: Scenario Terminal + Attack Vector ── */}
			<div className='flex gap-6 items-start'>
				<div className='flex-1 min-w-0'>
					<div className='bg-surface-1 border border-border-subtle rounded-2xl overflow-hidden shadow-xl'>
						<div className='px-5 py-3 border-b border-border-subtle bg-surface-2 flex items-center justify-between'>
							<div className='flex items-center gap-3'>
								<Terminal size={14} className='text-text-muted' />
								<span className='text-[11px] font-mono text-text-muted uppercase tracking-widest'>
									PAYLOAD.ATTACKER.SHELL
								</span>
							</div>
							<div className='flex gap-1.5'>
								<div className='size-3 rounded-full bg-success' />
								<div className='size-3 rounded-full bg-warning' />
								<div className='size-3 rounded-full bg-danger' />
							</div>
						</div>

						<div
							className='bg-surface-deep p-6 min-h-[360px] max-h-[420px] overflow-y-auto font-mono text-[11px] space-y-1.5 custom-scrollbar'
							ref={scrollRef}
						>
							{logs.length === 0 && !isSimulating && (
								<div className='text-text-muted/30 flex items-center gap-2'>
									<span className='animate-pulse'>▊</span>
									<span>Select an attack vector to begin simulation...</span>
								</div>
							)}
							{logs.map((log) => (
								<div
									key={log.id}
									className='animate-in slide-in-from-left-2 duration-200'
								>
									<div className='flex gap-3'>
										<span className='text-text-muted/50 shrink-0'>
											[{log.timestamp}]
										</span>
										<div className='flex flex-col gap-0.5 leading-relaxed'>
											<div className={getLogStyle(log.type)}>
												{getLogPrefix(log.type)}
												{log.type === 'blocked'
													? log.message.replace('AEGIS_EVENT: ', '')
													: log.message}
											</div>
											{log.details && (
												<div className='text-text-muted/60 ml-6 text-[10px]'>
													↳ {log.details}
												</div>
											)}
										</div>
									</div>
								</div>
							))}
							{isSimulating && (
								<div className='flex items-center gap-2 text-success animate-pulse mt-2'>
									<span>▊</span>
									<span>Executing adversarial vector...</span>
								</div>
							)}
						</div>
					</div>
				</div>

				<div className='w-[340px] shrink-0 flex flex-col gap-4'>
					<div className='bg-surface-1 border border-border-subtle rounded-2xl overflow-hidden shadow-xl'>
						<div className='px-6 py-5 flex items-start gap-4'>
							<div className='p-3 bg-danger-muted rounded-2xl'>
								<ShieldAlert className='text-danger' size={28} />
							</div>
							<div>
								<h2 className='text-lg font-bold text-text-primary'>
									Attack Vector
								</h2>
								<p className='text-text-muted text-xs mt-0.5'>
									Select fraud type
								</p>
							</div>
						</div>

						<div className='px-3 pb-3'>
							{scenarios.map((s) => {
								const isActive = selectedScenario?.id === s.id;
								return (
									<button
										key={s.id}
										disabled={isSimulating}
										onClick={() => runScenario(s)}
										className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group ${
											isActive
												? 'bg-surface-3 border border-border-medium'
												: 'hover:bg-surface-2 border border-transparent'
										} ${
											isSimulating && !isActive
												? 'opacity-40 cursor-not-allowed'
												: ''
										}`}
									>
										<div
											className={`p-2 rounded-xl transition-all duration-200 ${
												isActive
													? 'bg-surface-4'
													: 'bg-surface-2 group-hover:bg-surface-3'
											}`}
										>
											<s.icon
												size={16}
												className={`${s.color} transition-all duration-200`}
											/>
										</div>
										<span
											className={`flex-1 text-xs font-bold uppercase tracking-wider ${
												isActive ? 'text-text-primary' : 'text-text-secondary'
											}`}
										>
											{s.title}
										</span>
										<ChevronRight
											size={14}
											className={`text-text-muted/40 transition-all duration-200 ${
												isActive
													? 'text-text-muted opacity-100'
													: 'opacity-0 group-hover:opacity-100'
											}`}
										/>
									</button>
								);
							})}
						</div>
					</div>
				</div>
			</div>

			{/* ── NEW: HTGNN Attack Simulator ── */}
			<div className='bg-surface-1 border border-border-subtle rounded-2xl overflow-hidden shadow-xl'>
				<div className='px-6 py-4 border-b border-border-subtle bg-surface-2 flex items-center gap-3'>
					<div className='size-8 rounded-xl bg-danger-muted border border-danger/30 flex items-center justify-center'>
						<Zap size={16} className='text-danger' />
					</div>
					<div>
						<h2 className='text-sm font-bold text-text-primary'>
							HTGNN Attack Simulator
						</h2>
						<p className='text-[11px] text-text-muted'>
							Test model resilience with adversarial QRIS fraud patterns
						</p>
					</div>
					{atkRunning && (
						<div className='ml-auto flex items-center gap-2'>
							<Loader2 size={14} className='animate-spin text-danger' />
							<span className='text-[11px] text-danger font-medium'>
								Running...
							</span>
						</div>
					)}
				</div>

				<div className='p-6'>
					<div className='grid grid-cols-12 gap-6'>
						{/* ── Configuration Panel ── */}
						<div className='col-span-3 bg-surface-2 border border-border-subtle rounded-2xl p-5 space-y-5'>
							<h3 className='text-text-primary font-bold text-sm flex items-center gap-2'>
								<Zap size={14} className='text-danger' />
								Configuration
							</h3>
							<div>
								<label className='text-[10px] text-text-muted uppercase tracking-wider mb-2 block'>
									Transactions
								</label>
								<input
									type='range'
									min={50}
									max={2000}
									step={50}
									value={total}
									onChange={(e) => setTotal(Number(e.target.value))}
									disabled={atkRunning}
									className='w-full accent-red-500'
								/>
								<p className='text-center text-danger font-bold text-lg mt-1'>
									{total}
								</p>
							</div>
							<div>
								<label className='text-[10px] text-text-muted uppercase tracking-wider mb-2 block'>
									Fraud Ratio
								</label>
								<div className='grid grid-cols-2 gap-1.5'>
									{FRAUD_PRESETS.map((p) => (
										<button
											key={p.value}
											onClick={() => setFraudPct(p.value)}
											disabled={atkRunning}
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
								<label className='text-[10px] text-text-muted uppercase tracking-wider mb-2 block'>
									Speed
								</label>
								<div className='flex gap-1.5'>
									{(['slow', 'normal', 'fast'] as const).map((s) => (
										<button
											key={s}
											onClick={() => setSpeed(s)}
											disabled={atkRunning}
											className={`flex-1 py-2 rounded-lg text-[11px] font-medium transition-all ${speed === s ? 'bg-primary-muted text-primary border border-primary/30' : 'bg-surface-3 text-text-muted border border-border-subtle'}`}
										>
											{s.charAt(0).toUpperCase() + s.slice(1)}
										</button>
									))}
								</div>
							</div>
							<button
								onClick={atkRunning ? handleAtkStop : handleAtkStart}
								className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
									atkRunning
										? 'bg-danger-muted text-danger border border-danger/30 hover:bg-danger/20'
										: 'bg-linear-to-r from-danger to-primary text-white hover:shadow-lg hover:shadow-danger/20'
								}`}
							>
								{atkRunning ? (
									<>
										<Square size={14} /> Stop
									</>
								) : (
									<>
										<Play size={14} /> Launch Attack
									</>
								)}
							</button>
							{(atkRunning || atkProgress > 0) && (
								<div>
									<div className='flex justify-between text-[10px] text-text-muted mb-1'>
										<span>
											{atkProgress}/{total}
										</span>
										<span>{pctDone.toFixed(0)}%</span>
									</div>
									<div className='h-1.5 bg-surface-3 rounded-full overflow-hidden'>
										<div
											className='h-full bg-linear-to-r from-danger to-primary rounded-full transition-all'
											style={{ width: `${pctDone}%` }}
										/>
									</div>
									{atkRunning && (
										<p className='text-[10px] text-text-muted mt-1 text-center'>
											<Clock size={10} className='inline mr-1' />
											{atkElapsed}s elapsed
										</p>
									)}
								</div>
							)}
						</div>

						{/* ── Middle: Live Transaction Feed ── */}
						<div className='col-span-4 bg-surface-2 border border-border-subtle rounded-2xl p-5'>
							<h3 className='text-sm font-bold text-text-secondary mb-3 flex items-center gap-2'>
								<ShieldX size={14} className='text-danger' />
								Live Transaction Feed
								{atkRunning && (
									<span className='ml-auto size-2 rounded-full bg-danger animate-pulse' />
								)}
							</h3>
							<div className='space-y-1 max-h-[500px] overflow-y-auto custom-scrollbar'>
								{recentTxns.length === 0 ? (
									<p className='text-text-muted text-xs text-center py-6'>
										Waiting for transactions...
									</p>
								) : (
									recentTxns.slice(0, 30).map((txn: any, i: number) => (
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
												<span
													className={`px-1 py-0.5 rounded text-[8px] font-bold ${getFraudTypeStyle(txn.fraud_type)}`}
												>
													{txn.fraud_type.replace(/_/g, ' ')}
												</span>
											)}
										</div>
									))
								)}
							</div>
						</div>

						{/* ── Right: Detection by Fraud Type + Simulation Log ── */}
						<div className='col-span-5 flex flex-col gap-5'>
							{/* Detection by Fraud Type */}
							<div className='bg-surface-2 border border-border-subtle rounded-2xl p-5'>
								<h3 className='text-sm font-bold text-text-secondary mb-4 flex items-center gap-2'>
									<Hash size={14} className='text-purple' />
									Detection by Fraud Type
								</h3>
								{atkStats?.per_type &&
								Object.keys(atkStats.per_type).length > 0 ? (
									<div className='space-y-3'>
										{Object.entries(
											atkStats.per_type_total ?? atkStats.per_type,
										).map(([type, totalCount]: [string, any]) => {
											const detected = atkStats.per_type?.[type] ?? 0;
											const rate =
												totalCount > 0 ? (detected / totalCount) * 100 : 0;
											return (
												<div key={type}>
													<div className='flex justify-between text-[11px] mb-1'>
														<span className='text-text-secondary capitalize'>
															{type.replace(/_/g, ' ')}
														</span>
														<span className='text-text-muted'>
															{detected}/{totalCount as number} caught (
															{rate.toFixed(0)}%)
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
										{atkRunning
											? 'Collecting data...'
											: 'Launch an attack to see per-type breakdown'}
									</div>
								)}
							</div>

							{/* Simulation Log */}
							<div className='bg-surface-2 border border-border-subtle rounded-2xl p-5 flex-1'>
								<h3 className='text-sm font-bold text-text-secondary mb-3'>
									Simulation Log
								</h3>
								<div className='space-y-0.5 max-h-48 overflow-y-auto font-mono text-[10px] custom-scrollbar'>
									{simLogs.length === 0 ? (
										<p className='text-text-muted text-xs text-center py-6 font-sans'>
											Ready
										</p>
									) : (
										simLogs.map((log) => (
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
									<div ref={simLogsEndRef} />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
