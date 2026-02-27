import React, { useState, useRef } from 'react';
import { Send, ImagePlus, X } from 'lucide-react';

interface ChatInputProps {
	onSend: (message: string, image?: string) => void;
	disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled }) => {
	const [text, setText] = useState('');
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const handleSend = () => {
		const trimmed = text.trim();
		if (!trimmed && !imagePreview) return;
		onSend(trimmed || '(image)', imagePreview || undefined);
		setText('');
		setImagePreview(null);
		if (textareaRef.current) {
			textareaRef.current.style.height = 'auto';
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (ev) => {
			setImagePreview(ev.target?.result as string);
		};
		reader.readAsDataURL(file);
		if (fileInputRef.current) fileInputRef.current.value = '';
	};

	const hasContent = text.trim().length > 0 || !!imagePreview;

	return (
		<div className='px-6 py-4 bg-[#0f0f0f] border-t border-white/5'>
			<div className='bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden focus-within:border-orange-500/40 transition-colors'>
				{imagePreview && (
					<div className='px-4 pt-3'>
						<div className='relative inline-block'>
							<img
								src={imagePreview}
								alt='Preview'
								className='max-h-28 rounded-lg border border-white/10'
							/>
							<button
								onClick={() => setImagePreview(null)}
								className='absolute -top-2 -right-2 size-5 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-400 transition-colors'
							>
								<X size={12} />
							</button>
						</div>
					</div>
				)}

				<textarea
					ref={textareaRef}
					value={text}
					onChange={(e) => setText(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder='Ask about suspicious transactions, fraud patterns...'
					rows={1}
					disabled={disabled}
					className='w-full bg-transparent py-4 px-4 text-sm text-gray-200 placeholder-gray-600 resize-none focus:outline-none disabled:opacity-50'
					style={{ maxHeight: 160 }}
					onInput={(e) => {
						const t = e.target as HTMLTextAreaElement;
						t.style.height = 'auto';
						t.style.height = `${Math.min(t.scrollHeight, 160)}px`;
					}}
				/>
				<div className='flex items-center justify-between px-3 pb-3'>
					<div className='flex items-center gap-1'>
						<button
							onClick={() => fileInputRef.current?.click()}
							className='size-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-colors'
							title='Add Image'
						>
							<ImagePlus size={18} />
						</button>
						<input
							ref={fileInputRef}
							type='file'
							accept='image/*'
							className='hidden'
							onChange={handleImageSelect}
						/>
					</div>
					<button
						onClick={handleSend}
						disabled={disabled || !hasContent}
						className={`size-8 rounded-lg flex items-center justify-center transition-colors ${
							hasContent && !disabled
								? 'bg-orange-500 text-white hover:bg-orange-400'
								: 'text-gray-600 cursor-not-allowed'
						}`}
					>
						<Send size={16} />
					</button>
				</div>
			</div>
		</div>
	);
};
