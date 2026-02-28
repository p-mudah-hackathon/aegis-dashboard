import { useState, useEffect, type RefObject } from 'react';

export function useContainerDimensions(
	containerRef: RefObject<HTMLDivElement | null>,
) {
	const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;

		let rafId = 0;

		const updateSize = () => {
			const w = el.clientWidth || el.offsetWidth;
			const h = el.clientHeight || el.offsetHeight;
			if (w > 0 && h > 0) {
				setDimensions({ width: w, height: h });
			}
		};
		
		const ro = new ResizeObserver(() => {
			cancelAnimationFrame(rafId);
			rafId = requestAnimationFrame(updateSize);
		});
		ro.observe(el);

		updateSize();

		window.addEventListener('resize', updateSize);

		return () => {
			ro.disconnect();
			cancelAnimationFrame(rafId);
			window.removeEventListener('resize', updateSize);
		};
	}, [containerRef]);

	return dimensions;
}
