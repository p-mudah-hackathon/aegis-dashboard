import React from 'react';
import { LayoutGrid, Search, Settings, Share2 } from 'lucide-react';

const MENU_ITEMS = [
	{ id: 'dashboard', name: 'Dashboard', icon: LayoutGrid },
	{ id: 'investigate', name: 'Investigate', icon: Search },
	{ id: 'visualizer', name: 'Visualizer', icon: Share2 },
	{ id: 'settings', name: 'Settings', icon: Settings },
];

interface SidebarProps {
	activeTab: string;
	setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
	activeTab,
	setActiveTab,
}) => {
	return (
		<aside className='w-72 bg-[#121212] flex flex-col h-screen sticky top-0 border-r border-white/5 p-8'>
			<div className='mb-12'>
				<h1 className='text-white text-2xl font-bold tracking-widest'>AEGIS</h1>
			</div>

			<nav className='flex-1 space-y-2'>
				{MENU_ITEMS.map((item) => {
					const isActive = activeTab === item.id;
					return (
						<button
							key={item.id}
							onClick={() => setActiveTab(item.id)}
							className={`w-full flex items-center px-3 py-3.5 rounded-xl transition-all duration-200 group ${
								isActive
									? 'bg-orange-500/10 text-orange-500 border border-orange-500/20 shadow-[0_0_20px_rgba(249,115,22,0.1)]'
									: 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
							}`}
						>
							<item.icon
								className={`size-5 mr-4 transition-colors ${
									isActive
										? 'text-orange-500'
										: 'text-gray-400 group-hover:text-gray-300'
								}`}
							/>
							<span className='text-[15px] font-semibold tracking-wide'>
								{item.name}
							</span>
						</button>
					);
				})}
			</nav>
		</aside>
	);
};
