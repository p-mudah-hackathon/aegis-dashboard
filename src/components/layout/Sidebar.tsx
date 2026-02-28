import React, { useState, useEffect } from 'react';
import {
	LayoutGrid,
	MessageSquare,
	Share2,
	Skull,
	ChevronLeft,
	ChevronRight,
	Sun,
	Moon,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const MENU_ITEMS = [
	{ id: 'dashboard', path: '/dashboard', name: 'Dashboard', icon: LayoutGrid },
	{
		id: 'investigate',
		path: '/investigate',
		name: 'AI Chat',
		icon: MessageSquare,
	},
	{ id: 'attack', path: '/attack', name: 'Attack Simulator', icon: Skull },
	{ id: 'visualizer', path: '/visualizer', name: 'Visualizer', icon: Share2 },
];

export const Sidebar: React.FC = () => {
	const location = useLocation();
	const [isCollapsed, setIsCollapsed] = useState(false);
	const [isDark, setIsDark] = useState(true);

	useEffect(() => {
		if (isDark) {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	}, [isDark]);

	return (
		<aside
			className={`bg-card flex flex-col h-screen sticky top-0 border-r border-border transition-all duration-300 ease-in-out ${
				isCollapsed ? 'w-20 px-4 py-6' : 'w-72 p-6'
			}`}
		>
			<div className='flex items-center justify-between mb-10 overflow-hidden min-h-[48px]'>
				{!isCollapsed && (
					<div className='animate-in fade-in slide-in-from-left-4 duration-500'>
						<h1 className='text-foreground text-2xl font-bold tracking-widest'>
							AEGIS
						</h1>
						<p className='text-muted-foreground text-[10px] mt-1 tracking-wider'>
							FRAUD DETECTION
						</p>
					</div>
				)}
				<button
					onClick={() => setIsCollapsed(!isCollapsed)}
					className={`p-2 rounded-xl bg-accent text-muted-foreground hover:text-foreground hover:bg-accent/80 transition-all ${
						isCollapsed ? 'mx-auto' : ''
					}`}
				>
					{isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
				</button>
			</div>

			<nav className='flex-1 space-y-2 overflow-hidden'>
				{MENU_ITEMS.map((item) => {
					const isActive = location.pathname.startsWith(item.path);
					return (
						<Link
							key={item.id}
							to={item.path}
							title={isCollapsed ? item.name : ''}
							className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 group relative ${
								isActive
									? 'bg-primary/10 text-primary border border-primary/20'
									: 'text-muted-foreground hover:bg-accent hover:text-foreground'
							}`}
						>
							<div
								className={`flex items-center transition-all ${isCollapsed ? 'mx-auto' : ''}`}
							>
								<item.icon
									className={`size-5 transition-colors ${
										isActive
											? 'text-primary'
											: 'text-muted-foreground group-hover:text-foreground'
									} ${!isCollapsed ? 'mr-4' : ''}`}
								/>
								{!isCollapsed && (
									<span className='text-[14px] font-semibold tracking-wide whitespace-nowrap animate-in fade-in duration-300'>
										{item.name}
									</span>
								)}
							</div>
						</Link>
					);
				})}
			</nav>

			<div className='mt-auto pt-6 border-t border-border flex flex-col gap-4 overflow-hidden'>
				<button
					onClick={() => setIsDark(!isDark)}
					className={`flex items-center p-3 rounded-xl transition-all group justify-center bg-accent text-muted-foreground hover:text-foreground hover:bg-accent/80`}
					title={
						isCollapsed ? (isDark ? 'Switch to Light' : 'Switch to Dark') : ''
					}
				>
					{isDark ? (
						<Sun
							size={isCollapsed ? 22 : 18}
							className={!isCollapsed ? 'mr-2' : ''}
						/>
					) : (
						<Moon
							size={isCollapsed ? 22 : 18}
							className={!isCollapsed ? 'mr-2' : ''}
						/>
					)}
					{!isCollapsed && (
						<span className='text-sm font-medium animate-in fade-in duration-300 whitespace-nowrap'>
							{isDark ? 'Light Mode' : 'Dark Mode'}
						</span>
					)}
				</button>
			</div>
		</aside>
	);
};
