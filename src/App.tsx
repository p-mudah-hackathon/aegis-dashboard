import { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardPage } from './features/dashboard';
import { Visualizer } from './features/visualizer';
import { InvestigatePage } from './features/investigate';

function App() {
	const [activeTab, setActiveTab] = useState('dashboard');

	return (
		<div className='flex bg-[#0a0a0a] h-screen text-white font-sans overflow-hidden'>
			<Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

			<main className='flex-1 flex flex-col overflow-hidden'>
				{activeTab === 'dashboard' && <DashboardPage />}
				{activeTab === 'investigate' && <InvestigatePage />}
				{activeTab === 'visualizer' && <Visualizer />}
				{!['dashboard', 'investigate', 'visualizer'].includes(activeTab) && (
					<div className='flex-1 flex items-center justify-center text-gray-500'>
						Content for {activeTab} will be here...
					</div>
				)}
			</main>
		</div>
	);
}

export default App;
