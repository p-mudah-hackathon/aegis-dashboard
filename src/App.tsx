import { Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardPage } from './features/dashboard';
import { Visualizer } from './features/visualizer';
import { InvestigatePage } from './features/investigate';
import { AttackSimulatorPage } from './features/attack';

function App() {

	return (
		<div className='flex bg-[#0a0a0a] h-screen text-white font-sans overflow-hidden'>
			<Sidebar />

			<main className='flex-1 flex flex-col overflow-hidden'>
				<Routes>
					<Route path='/' element={<Navigate to='/dashboard' replace />} />
					<Route path='/dashboard' element={<DashboardPage />} />
					<Route path='/investigate' element={<InvestigatePage />} />
					<Route path='/investigate/:txnId' element={<InvestigatePage />} />
					<Route path='/attack' element={<AttackSimulatorPage />} />
					<Route path='/visualizer' element={<Visualizer />} />
					<Route path='*' element={
						<div className='flex-1 flex items-center justify-center text-gray-500'>
							Page not found
						</div>
					} />
				</Routes>
			</main>
		</div>
	);
}

export default App;
