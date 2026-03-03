import React, { useState, useEffect, useRef } from 'react';
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
} from 'lucide-react';

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

export const AttackLogView: React.FC = () => {
	const [logs, setLogs] = useState<Log[]>([]);
	const [isSimulating, setIsSimulating] = useState(false);
	const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(
		null,
	);
	const scrollRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [logs]);

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
		<div className='animate-in fade-in duration-700'>
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
		</div>
	);
};
