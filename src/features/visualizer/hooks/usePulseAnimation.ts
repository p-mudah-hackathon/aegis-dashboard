import { useState, useEffect } from 'react';

export function usePulseAnimation() {
	const [pulsePhase, setPulsePhase] = useState(0);

	useEffect(() => {
		let animFrame: number;
		const animate = () => {
			setPulsePhase(Date.now() / 2500);
			animFrame = requestAnimationFrame(animate);
		};
		animFrame = requestAnimationFrame(animate);
		return () => cancelAnimationFrame(animFrame);
	}, []);

	return pulsePhase;
}
