import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
	children: React.ReactNode;
	fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
}

export class ErrorBoundary extends React.Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		console.error('[ErrorBoundary] Caught error:', error, errorInfo);
	}

	handleReset = () => {
		this.setState({ hasError: false, error: null });
	};

	render() {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback;
			}

			return (
				<div className='flex flex-col items-center justify-center gap-3 py-8 px-4 text-center'>
					<div className='p-2.5 rounded-xl bg-danger-muted'>
						<AlertTriangle size={20} className='text-danger' />
					</div>
					<div>
						<p className='text-sm font-medium text-foreground'>
							Something went wrong
						</p>
						<p className='text-xs text-muted-foreground mt-1'>
							This component failed to render
						</p>
					</div>
					<button
						onClick={this.handleReset}
						className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-accent text-foreground hover:bg-accent/80 transition-colors cursor-pointer'
					>
						<RefreshCw size={12} />
						Try Again
					</button>
				</div>
			);
		}

		return this.props.children;
	}
}
