import React, { useState, useEffect, useRef } from 'react';
import {
	Zap,
	Skull,
	Play,
	CreditCard,
	Globe,
	Activity,
	Layers,
	Wifi,
	X,
	ShieldAlert,
	Info,
} from 'lucide-react';

interface Log {
	id: number;
	type: 'attack' | 'system' | 'blocked' | 'success';
	message: string;
	timestamp: string;
	details?: string;
}

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

const AttackResultModal: React.FC<{
	isOpen: boolean;
	onClose: () => void;
	scenario: Scenario | null;
	logs: Log[];
	isSimulating: boolean;
}> = ({ isOpen, onClose, scenario, logs, isSimulating }) => {
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
				{/* Modal Header */}
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

				{/* Terminal Content */}
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

				{/* AEGIS Analysis Footer */}
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

export const AttackLogView: React.FC = () => {
	const [logs, setLogs] = useState<Log[]>([]);
	const [isSimulating, setIsSimulating] = useState(false);
	const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(
		null,
	);
	const [showModal, setShowModal] = useState(false);

	const scenarios: Scenario[] = [
		{
			id: 'velocity_attack',
			icon: Zap,
			title: 'Velocity Attack',
			description:
				'Compromised foreign e-wallet scans 10+ Paylabs dynamic QRIS codes across Bali and Jakarta in under 3 minutes before principal bank blocks it.',
			reason:
				'Abnormal transaction density: 12 scans/180s from unique Geo-ID cluster.',
			color: 'text-purple-400',
			borderColor: 'border-purple-400/20',
			glowColor: 'shadow-[0_0_15px_-3px_rgba(168,85,247,0.2)]',
			accent: 'bg-purple-500',
			logs: [
				{ type: 'system', message: 'SCAN_INIT: QRIS_DYNAMIC_PAYLABS_0821' },
				{ type: 'system', message: 'SCAN_INIT: QRIS_DYNAMIC_PAYLABS_0822' },
				{
					type: 'attack',
					message: 'THREAD_SPAWN: Multi-geo scanning session active',
					details: 'Loc: [Jakarta, Bali, Surabaya]',
				},
				{ type: 'system', message: 'SCAN_INIT: QRIS_DYNAMIC_PAYLABS_0823' },
			],
		},
		{
			id: 'card_testing',
			icon: Activity,
			title: 'Wallet Probing',
			description:
				'Bot probes with tiny QRIS scans (Rp 10K) to verify inbound tourist wallet status and exchange rate, then executes a massive Rp 5M+ cash-out.',
			reason:
				'Probing behavior detected: Micropayment verification followed by high-value outlier.',
			color: 'text-cyan-400',
			borderColor: 'border-cyan-400/20',
			glowColor: 'shadow-[0_0_15px_-3px_rgba(34,211,238,0.2)]',
			accent: 'bg-cyan-500',
			logs: [
				{ type: 'system', message: 'TXN_REQ: IDR 10,000.00 (Status Check)' },
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
				'3–5 synthetic foreign accounts sharing the same VPN IP subnet simultaneously routing high-value QRIS payments to a single Paylabs F&B merchant.',
			reason:
				'Sybil cluster detected: 5 accounts mapped to 103.42.11.x subnet routing to Merchant_ID_442.',
			color: 'text-pink-400',
			borderColor: 'border-pink-400/20',
			glowColor: 'shadow-[0_0_15px_-3px_rgba(244,114,182,0.2)]',
			accent: 'bg-pink-500',
			logs: [
				{ type: 'system', message: 'INBOUND_CONN: 103.42.11.4 [VPN_DETECTED]' },
				{ type: 'system', message: 'INBOUND_CONN: 103.42.11.8 [VPN_DETECTED]' },
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
				'Same Alipay/WeChat account scans QRIS in Jakarta and Bali 10 minutes apart. Indicates Account Takeover or illicit sharing of static QR screenshots.',
			reason:
				'Impossible travel: Speed 600km/h detected between nodes. Flagged as Account Takeover.',
			color: 'text-amber-400',
			borderColor: 'border-amber-400/20',
			glowColor: 'shadow-[0_0_15px_-3px_rgba(251,191,36,0.2)]',
			accent: 'bg-amber-500',
			logs: [
				{ type: 'system', message: 'TXN_LOC: Jakarta (S-Node-01)' },
				{
					type: 'attack',
					message: 'TOKEN_REUSE: Session pulse detected in Bali',
					details: 'Delta: 600 seconds',
				},
				{ type: 'system', message: 'VALIDATING_GPS_FENCE: Hardware mismatch' },
			],
		},
		{
			id: 'amount_anomaly',
			icon: CreditCard,
			title: 'Amount Anomaly',
			description:
				'Rp 5M+ cross-border QRIS settlement at 3 AM on a small merchant that normally processes Rp 50K daily average. Off-hours money laundering.',
			reason:
				'Off-hours anomaly: High-value settlement outside operating window for SmallBusiness_Tier.',
			color: 'text-red-400',
			borderColor: 'border-red-400/20',
			glowColor: 'shadow-[0_0_15px_-3px_rgba(248,113,113,0.2)]',
			accent: 'bg-red-500',
			logs: [
				{ type: 'system', message: 'SETTLEMENT_REQ: IDR 5,200,000.00' },
				{ type: 'system', message: 'TIME_SCAN: 03:14:22 [OFF_HOURS]' },
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
		setShowModal(true);
		setIsSimulating(true);
		setLogs([]);

		addLog('system', `BOOT_SEQUENCE: ADVERSARY_ENV_V2.0`);
		addLog('system', `TARGET_GATEWAY: paylabs.api.production`);

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
				`AEGIS_BLOCK: ${scenario.title.toUpperCase()}`,
				`Logic: ${scenario.reason}`,
			);
			addLog(
				'system',
				`GATEWAY_SIGNAL: TERMINATED`,
				`Risk Score: 0.99 [CRITICAL]`,
			);
			setIsSimulating(false);
		}, delay + 400);
	};

	return (
		<div className='animate-in fade-in duration-700'>
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
				{scenarios.map((s) => (
					<button
						key={s.id}
						disabled={isSimulating}
						onClick={() => runScenario(s)}
						className={`group relative p-8 bg-[#0d0d0d] border border-white/5 rounded-3xl text-left transition-all duration-500 overflow-hidden ${
							isSimulating
								? 'opacity-50 cursor-not-allowed'
								: 'hover:border-white/20 hover:bg-[#121212] hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50'
						}`}
					>
						<div
							className={`absolute inset-0 opacity-0 group-hover:opacity-[0.05] transition-opacity duration-700 rounded-3xl ${s.accent} blur-2xl`}
						/>

						<div className='relative z-10'>
							<div className='flex items-center justify-between mb-6'>
								<div
									className={`p-3 rounded-2xl border bg-black transition-all duration-500 group-hover:scale-110 group-hover:bg-zinc-900 ${s.borderColor} ${s.glowColor} group-hover:border-opacity-100 group-hover:shadow-[0_0_20px_0px_rgba(255,255,255,0.1)]`}
								>
									<s.icon
										size={24}
										className={`${s.color} transition-all duration-500 group-hover:brightness-125 group-hover:stroke-[2.5px]`}
									/>
								</div>
								<div className='flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
									<span className='text-[10px] text-zinc-500 font-bold uppercase'>
										Simulate
									</span>
									<Play size={10} className='text-zinc-500' />
								</div>
							</div>

							<h3 className='text-white font-bold text-lg mb-3'>{s.title}</h3>
							<p className='text-zinc-500 text-xs leading-relaxed line-clamp-3'>
								{s.description}
							</p>
						</div>
						<div className='absolute -right-8 -bottom-8 opacity-[0.03] group-hover:opacity-[0.12] transition-all duration-700 pointer-events-none'>
							<s.icon
								size={160}
								className={`${s.color} transition-all duration-700 group-hover:scale-110`}
								style={{
									filter: isSimulating
										? 'none'
										: `drop-shadow(0 0 12px currentColor)`,
								}}
							/>
						</div>
					</button>
				))}
			</div>

			<AttackResultModal
				isOpen={showModal}
				onClose={() => setShowModal(false)}
				scenario={selectedScenario}
				logs={logs}
				isSimulating={isSimulating}
			/>
		</div>
	);
};
