import React, { useState, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { StatCard } from './components/StatCard';
import { TransactionTable } from './components/TransactionTable';
import { DUMMY_TRANSACTIONS } from './constants';
import type { Transaction, TransactionStatus } from './types';
import { Activity, AlertTriangle, ShieldBan, Clock } from 'lucide-react';

export const DashboardPage: React.FC = () => {
	const [transactions, setTransactions] =
		useState<Transaction[]>(DUMMY_TRANSACTIONS);

	const handleStatusChange = useCallback(
		(txnId: string, newStatus: TransactionStatus) => {
			setTransactions((prev) =>
				prev.map((t) => (t.txnId === txnId ? { ...t, status: newStatus } : t)),
			);
		},
		[],
	);

	// Compute stats from live data
	const stats = useMemo(() => {
		const total = transactions.length;
		const pending = transactions.filter((t) => t.status === 'PENDING').length;
		const flagged = transactions.filter((t) => t.status === 'FLAGGED').length;
		const blocked = transactions.filter((t) => t.status === 'BLOCKED').length;
		return { total, pending, flagged, blocked };
	}, [transactions]);

	return (
		<div className='flex-1 p-10 overflow-y-auto'>
			<Header />

			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10'>
				<StatCard
					title='Total Transactions'
					value={stats.total.toLocaleString()}
					label='Monitored'
					subtitle='QRIS payments processed'
					icon={Activity}
					borderColor='border-blue-500/50'
					iconBgColor='bg-blue-500/10'
					iconColor='text-blue-500'
				/>
				<StatCard
					title='Pending Review'
					value={stats.pending.toString()}
					label='Transactions'
					subtitle='Awaiting analyst decision'
					icon={Clock}
					borderColor='border-yellow-500/50'
					iconBgColor='bg-yellow-500/10'
					iconColor='text-yellow-500'
				/>
				<StatCard
					title='Flagged Activity'
					value={stats.flagged.toString()}
					label='Flagged'
					subtitle='Require further investigation'
					icon={AlertTriangle}
					borderColor='border-orange-500/50'
					iconBgColor='bg-orange-500/10'
					iconColor='text-orange-500'
				/>
				<StatCard
					title='Blocked Transactions'
					value={stats.blocked.toString()}
					label='Blocked'
					subtitle='High-risk auto/manual block'
					icon={ShieldBan}
					borderColor='border-[#ff4d4d]/50'
					iconBgColor='bg-[#ff4d4d]/10'
					iconColor='text-[#ff4d4d]'
				/>
			</div>

			<TransactionTable
				transactions={transactions}
				onStatusChange={handleStatusChange}
			/>
		</div>
	);
};
