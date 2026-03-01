import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardPage } from './features/dashboard';
import { Visualizer } from './features/visualizer';
import { InvestigatePage } from './features/investigate';
import { AttackSimulatorPage } from './features/attack';
import { OperationSimulatorPage } from './features/operation-simulator';

const PAGE_TITLES: Record<string, string> = {
	'/dashboard': 'Aegis - Dashboard',
	'/investigate': 'Aegis - Investigate',
	'/attack': 'Aegis - Attack Simulator',
	'/visualizer': 'Aegis - Visualizer',
	'/operation-simulator': 'Aegis - Operation Simulator',
};

function App() {
	const location = useLocation();
	const isSimulator = location.pathname === '/operation-simulator';

	useEffect(() => {
		const title = Object.entries(PAGE_TITLES).find(([path]) =>
			location.pathname.startsWith(path),
		);
		document.title = title ? title[1] : 'Aegis';
	}, [location.pathname]);

	return (
		<div className='flex bg-background h-screen text-foreground font-sans overflow-hidden'>
			{!isSimulator && <Sidebar />}

			<main className='flex-1 flex flex-col overflow-hidden'>
				<Routes>
					<Route path='/' element={<Navigate to='/dashboard' replace />} />
					<Route path='/dashboard' element={<DashboardPage />} />
					<Route path='/investigate' element={<InvestigatePage />} />
					<Route path='/investigate/:txnId' element={<InvestigatePage />} />
					<Route path='/attack' element={<AttackSimulatorPage />} />
					<Route path='/visualizer' element={<Visualizer />} />
					<Route
						path='/operation-simulator'
						element={<OperationSimulatorPage />}
					/>
					<Route
						path='*'
						element={
							<div className='flex-1 flex items-center justify-center text-gray-500'>
								Page not found
							</div>
						}
					/>
				</Routes>
			</main>
		</div>
	);
}

export default App;
