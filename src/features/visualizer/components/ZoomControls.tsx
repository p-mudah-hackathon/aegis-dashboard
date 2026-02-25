import React from 'react';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface ZoomControlsProps {
	onZoomIn: () => void;
	onZoomOut: () => void;
	onZoomFit: () => void;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({
	onZoomIn,
	onZoomOut,
	onZoomFit,
}) => {
	return (
		<div className='absolute top-6 right-6 flex flex-col gap-1.5 z-20'>
			{[
				{ icon: ZoomIn, action: onZoomIn, label: 'Zoom In' },
				{ icon: ZoomOut, action: onZoomOut, label: 'Zoom Out' },
				{ icon: Maximize2, action: onZoomFit, label: 'Fit' },
			].map((btn, i) => (
				<button
					key={i}
					onClick={btn.action}
					title={btn.label}
					className='p-2.5 bg-[#121212]/90 backdrop-blur-md border border-white/10 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all'
				>
					<btn.icon size={16} />
				</button>
			))}
		</div>
	);
};
