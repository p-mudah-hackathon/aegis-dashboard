import React, { useState } from 'react';
import {
	ChevronLeft,
	MoreVertical,
	ShieldCheck,
	CreditCard,
	CheckCircle2,
} from 'lucide-react';

import { createPaylabsQris } from '../../../api';

interface QRISPaymentViewProps {
	onPaymentSuccess: (details: { amount: number; merchant: string }) => void;
}

export const QRISPaymentView: React.FC<QRISPaymentViewProps> = ({
	onPaymentSuccess,
}) => {
	const [status, setStatus] = useState<'idle' | 'processing' | 'success'>(
		'idle',
	);
	const [amount] = useState(1500000);
	const [merchant] = useState('Paylabs Merchant - Gandaria City');
	const [qrCodeData, setQrCodeData] = useState<string | null>(null);

	const handlePay = async () => {
		setStatus('processing');
		
		try {
			// Trigger backend integration which talks to real Paylabs API
			const res = await createPaylabsQris(amount, merchant);
			console.log('Real Paylabs QRIS Generated:', res.payCode);
			setQrCodeData(res.payCode);
			
			// Simulate user scan and completion delay
			setTimeout(() => {
				setStatus('success');
				onPaymentSuccess({ amount, merchant });
			}, 3000);
		} catch (error) {
			console.error('Failed to create Paylabs QRIS:', error);
			setStatus('idle');
			alert('Failed to connect to Paylabs API. Check credentials/network.');
		}
	};

	return (
		<div className='flex items-center justify-center p-8 bg-surface-2/50 rounded-3xl border border-border-subtle'>
			<div className='relative w-[340px] h-[680px] bg-black rounded-[48px] border-8 border-zinc-900 shadow-2xl overflow-hidden flex flex-col ring-1 ring-border-subtle/30'>
				<div className='h-8 w-full bg-transparent flex justify-between items-center px-8 pt-4 z-10'>
					<span className='text-[10px] text-white font-medium'>11:24</span>
					<div className='flex gap-1.5'>
						<div className='w-3 h-3 bg-white/20 rounded-full' />
						<div className='w-3 h-3 bg-white/20 rounded-full' />
					</div>
				</div>
				<div className='flex-1 flex flex-col'>
					<div className='p-6 flex items-center justify-between'>
						<button className='p-2 rounded-full hover:bg-white/5 transition-colors'>
							<ChevronLeft size={20} className='text-white' />
						</button>
						<span className='text-sm font-bold text-white uppercase tracking-widest'>
							Payment
						</span>
						<button className='p-2 rounded-full hover:bg-white/5 transition-colors'>
							<MoreVertical size={20} className='text-white' />
						</button>
					</div>

						{status !== 'success' ? (
						<div className='flex-1 flex flex-col px-6 pt-4'>
							<div className='size-16 bg-primary rounded-2xl flex items-center justify-center self-center shadow-lg mb-4'>
								<span className='text-white text-2xl font-bold'>P</span>
							</div>

							<h2 className='text-white text-lg font-bold text-center leading-tight mb-1'>
								{merchant}
							</h2>
							<p className='text-success/80 text-[10px] text-center mb-6 tracking-[0.2em] uppercase font-bold'>
								Secured by Paylabs
							</p>

							{qrCodeData ? (
								<div className='flex justify-center mb-6 animate-in fade-in zoom-in duration-500'>
									<div className='bg-white p-4 rounded-3xl shadow-xl'>
										<img 
											src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrCodeData)}`} 
											alt="QRIS Code" 
											className='w-48 h-48 sm:w-56 sm:h-56'
										/>
									</div>
								</div>
							) : (
								<div className='bg-zinc-900 border border-border-subtle/20 rounded-3xl p-6 mb-6 text-center'>
									<p className='text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-1'>
										Payment Amount
									</p>
									<div className='flex items-center justify-center gap-2'>
										<span className='text-zinc-400 text-sm font-bold pt-1'>
											IDR
										</span>
										<span className='text-white text-3xl font-bold'>
											{amount.toLocaleString('id-ID')}
										</span>
									</div>
								</div>
							)}

							<div className='space-y-3 mb-auto'>
								<label className='text-[10px] text-zinc-500 uppercase font-bold tracking-widest px-2'>
									Select Source
								</label>
								<div className='bg-zinc-900 border border-primary/30 rounded-2xl p-4 flex items-center gap-4'>
									<div className='size-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20'>
										<CreditCard size={20} className='text-primary' />
									</div>
									<div className='flex-1'>
										<p className='text-white text-sm font-bold'>
											Paylabs Balance
										</p>
										<p className='text-zinc-500 text-[11px]'>
											IDR 5,420,000 available
										</p>
									</div>
									<div className='size-4 rounded-full border-2 border-primary flex items-center justify-center'>
										<div className='size-2 bg-primary rounded-full' />
									</div>
								</div>
							</div>
							<button
								onClick={handlePay}
								disabled={status === 'processing'}
								className={`w-full py-4 rounded-2xl text-white font-bold text-sm shadow-xl shadow-primary/10 transition-all active:scale-95 mb-10 flex items-center justify-center gap-2
									${status === 'processing' ? 'bg-zinc-800' : 'bg-primary'}`}
							>
								{status === 'processing' ? (
									<div className='size-5 border-2 border-white/20 border-t-white rounded-full animate-spin' />
								) : (
									<>
										<ShieldCheck size={18} /> Pay Now
									</>
								)}
							</button>
						</div>
					) : (
						<div className='flex-1 flex flex-col items-center justify-center px-10 text-center animate-in fade-in zoom-in duration-500'>
							<div className='size-24 bg-success/20 rounded-full flex items-center justify-center mb-6 border-2 border-success/30'>
								<CheckCircle2 size={48} className='text-success' />
							</div>
							<h2 className='text-white text-2xl font-bold mb-2'>
								Payment Successful!
							</h2>
							<p className='text-zinc-400 text-sm leading-relaxed'>
								Your payment to{' '}
								<span className='text-white font-bold'>{merchant}</span> has
								been processed.
							</p>

							<div className='w-full border-t border-dashed border-zinc-800 my-8' />

							<div className='w-full space-y-4 mb-10'>
								<div className='flex justify-between items-center'>
									<span className='text-zinc-500 text-xs'>Merchant</span>
									<span className='text-white text-xs font-bold'>Paylabs</span>
								</div>
								<div className='flex justify-between items-center'>
									<span className='text-zinc-500 text-xs'>Txn ID</span>
									<span className='text-white text-xs font-mono'>
										#PL-748293
									</span>
								</div>
							</div>

							<button
								onClick={() => setStatus('idle')}
								className='w-full py-4 rounded-2xl bg-zinc-900 border border-border-subtle/30 text-white font-bold text-sm hover:bg-zinc-800 transition-all'
							>
								Done
							</button>
						</div>
					)}
				</div>

				<div className='h-1.5 w-32 bg-zinc-800 rounded-full mb-2 self-center' />
			</div>
		</div>
	);
};
