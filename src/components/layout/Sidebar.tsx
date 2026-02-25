import React from 'react';
import { LayoutGrid, MessageSquare, Share2, Settings, Skull } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const MENU_ITEMS = [
	{ id: 'dashboard', path: '/dashboard', name: 'Dashboard', icon: LayoutGrid },
	{ id: 'investigate', path: '/investigate', name: 'AI Chat', icon: MessageSquare },
	{ id: 'attack', path: '/attack', name: 'Attack Sim', icon: Skull },
	{ id: 'visualizer', path: '/visualizer', name: 'Visualizer', icon: Share2 },
	{ id: 'settings', path: '/settings', name: 'Settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
	const location = useLocation();
	return (
		<aside className='w-72 bg-[#121212] flex flex-col h-screen sticky top-0 border-r border-white/5 p-8'>
			<div className='mb-12'>
				<h1 className='text-white text-2xl font-bold tracking-widest'>AEGIS</h1>
				<p className='text-gray-600 text-[10px] mt-1 tracking-wider'>FRAUD DETECTION PLATFORM</p>
			</div>

			<nav className='flex-1 space-y-2'>
				{MENU_ITEMS.map((item) => {
					const isActive = location.pathname.startsWith(item.path);
					return (
						<Link
							key={item.id}
							to={item.path}
							className={`w-full flex items-center px-3 py-3.5 rounded-xl transition-all duration-200 group ${isActive
								? 'bg-orange-500/10 text-orange-500 border border-orange-500/20 shadow-[0_0_20px_rgba(249,115,22,0.1)]'
								: 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
								}`}
						>
							<item.icon
								className={`size-5 mr-4 transition-colors ${isActive
									? 'text-orange-500'
									: 'text-gray-400 group-hover:text-gray-300'
									}`}
							/>
							<span className='text-[15px] font-semibold tracking-wide'>
								{item.name}
							</span>
						</Link>
					);
				})}
			</nav>
		</aside>
	);
};
