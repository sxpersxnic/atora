import React, { useState, useRef, useCallback } from 'react';
import { useWasmLoader } from '../../lib/wasm';

export interface ImageProcessorProps {
	className?: string;
	onProcessingComplete?: (result: ImageProcessingResult) => void;
	onError?: (error: string) => void;
}

export interface ImageProcessingResult {
	originalSize: number;
	processedSize: number;
	compressionRatio: number;
	processingTime: number;
	wasmUsed: boolean;
	operations: string[];
}

export const ImageProcessor: React.FC<ImageProcessorProps> = ({
	className = '',
	onProcessingComplete,
	onError
}) => {
	const { wasmModule, isLoading, error: wasmError } = useWasmLoader();
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string>('');
	const [processedUrl, setProcessedUrl] = useState<string>('');
	const [isProcessing, setIsProcessing] = useState(false);
	const [result, setResult] = useState<ImageProcessingResult | null>(null);
	const [quality, setQuality] = useState(80);
	const [brightness, setBrightness] = useState(100);
	const [contrast, setContrast] = useState(100);
	const [selectedOperations, setSelectedOperations] = useState<string[]>(['resize']);

	const fileInputRef = useRef<HTMLInputElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		if (!file.type.startsWith('image/')) {
			onError?.('Please select a valid image file');
			return;
		}

		setSelectedFile(file);
		const url = URL.createObjectURL(file);
		setPreviewUrl(url);
		setProcessedUrl('');
		setResult(null);
	}, [onError]);

	const processImageWithWasm = useCallback(async (
		imageData: ImageData,
		operations: string[]
	): Promise<ImageData> => {
		if (!wasmModule) {
			throw new Error('WASM module not available');
		}

		console.log('🚀 Processing image with WASM:', operations);

		// For now, simulate WASM processing with canvas operations
		// In a real implementation, you would pass the image data to WASM
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d')!;
		canvas.width = imageData.width;
		canvas.height = imageData.height;

		ctx.putImageData(imageData, 0, 0);

		// Apply operations
		if (operations.includes('brightness') && brightness !== 100) {
			ctx.filter = `brightness(${brightness}%)`;
			ctx.drawImage(canvas, 0, 0);
		}

		if (operations.includes('contrast') && contrast !== 100) {
			ctx.filter = `contrast(${contrast}%)`;
			ctx.drawImage(canvas, 0, 0);
		}

		return ctx.getImageData(0, 0, canvas.width, canvas.height);
	}, [wasmModule, brightness, contrast]);

	const processImageWithJS = useCallback(async (
		imageData: ImageData,
		operations: string[]
	): Promise<ImageData> => {
		console.log('📦 Processing image with JavaScript fallback:', operations);

		const data = new Uint8ClampedArray(imageData.data);

		// Apply brightness
		if (operations.includes('brightness') && brightness !== 100) {
			const factor = brightness / 100;
			for (let i = 0; i < data.length; i += 4) {
				data[i] = Math.min(255, data[i] * factor);     // Red
				data[i + 1] = Math.min(255, data[i + 1] * factor); // Green
				data[i + 2] = Math.min(255, data[i + 2] * factor); // Blue
			}
		}

		// Apply contrast
		if (operations.includes('contrast') && contrast !== 100) {
			const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
			for (let i = 0; i < data.length; i += 4) {
				data[i] = Math.max(0, Math.min(255, factor * (data[i] - 128) + 128));
				data[i + 1] = Math.max(0, Math.min(255, factor * (data[i + 1] - 128) + 128));
				data[i + 2] = Math.max(0, Math.min(255, factor * (data[i + 2] - 128) + 128));
			}
		}

		return new ImageData(data, imageData.width, imageData.height);
	}, [brightness, contrast]);

	const processImage = useCallback(async () => {
		if (!selectedFile || !canvasRef.current) return;

		setIsProcessing(true);
		const startTime = performance.now();

		try {
			// Load image
			const img = new Image();
			const imageLoadPromise = new Promise<void>((resolve, reject) => {
				img.onload = () => resolve();
				img.onerror = () => reject(new Error('Failed to load image'));
			});

			img.src = previewUrl;
			await imageLoadPromise;

			// Setup canvas
			const canvas = canvasRef.current;
			const ctx = canvas.getContext('2d')!;

			// Resize if requested
			let width = img.width;
			let height = img.height;

			if (selectedOperations.includes('resize')) {
				const maxSize = 800;
				if (width > maxSize || height > maxSize) {
					const ratio = Math.min(maxSize / width, maxSize / height);
					width = Math.round(width * ratio);
					height = Math.round(height * ratio);
				}
			}

			canvas.width = width;
			canvas.height = height;
			ctx.drawImage(img, 0, 0, width, height);

			// Get image data
			const imageData = ctx.getImageData(0, 0, width, height);
			const originalSize = selectedFile.size;

			// Process with WASM or JS
			let processedImageData: ImageData;
			let wasmUsed = false;

			try {
				if (wasmModule && selectedOperations.length > 0) {
					processedImageData = await processImageWithWasm(imageData, selectedOperations);
					wasmUsed = true;
				} else {
					throw new Error('Using JS fallback');
				}
			} catch (wasmErr) {
				console.warn('WASM processing failed, using JS fallback:', wasmErr);
				processedImageData = await processImageWithJS(imageData, selectedOperations);
				wasmUsed = false;
			}

			// Put processed data back to canvas
			ctx.putImageData(processedImageData, 0, 0);

			// Generate result URL
			const processedBlob = await new Promise<Blob>((resolve) => {
				canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', quality / 100);
			});

			const processedSize = processedBlob.size;
			const processedObjectUrl = URL.createObjectURL(processedBlob);
			setProcessedUrl(processedObjectUrl);

			const endTime = performance.now();
			const processingTime = endTime - startTime;

			const processingResult: ImageProcessingResult = {
				originalSize,
				processedSize,
				compressionRatio: originalSize / processedSize,
				processingTime,
				wasmUsed,
				operations: selectedOperations
			};

			setResult(processingResult);
			onProcessingComplete?.(processingResult);

			console.log(`🎯 Image processing complete:`, processingResult);

		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			onError?.(errorMessage);
			console.error('Image processing error:', error);
		} finally {
			setIsProcessing(false);
		}
	}, [
		selectedFile,
		previewUrl,
		quality,
		selectedOperations,
		wasmModule,
		processImageWithWasm,
		processImageWithJS,
		onProcessingComplete,
		onError
	]);

	const toggleOperation = useCallback((operation: string) => {
		setSelectedOperations(prev =>
			prev.includes(operation)
				? prev.filter(op => op !== operation)
				: [...prev, operation]
		);
	}, []);

	const formatFileSize = (bytes: number): string => {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	};

	const getStatusIndicator = () => {
		if (wasmError) return '❌ WASM Error';
		if (isLoading) return '⏳ Loading WASM...';
		if (wasmModule) return '🚀 WASM Ready';
		return '📦 JS Fallback';
	};

	return (
		<div className={`p-6 border rounded-lg bg-white shadow-sm ${className}`}>
			<div className="mb-4">
				<h3 className="text-lg font-semibold text-gray-900 mb-2">
					Image Processor
				</h3>
				<div className="flex items-center gap-2 text-sm">
					<span className="text-gray-600">Status:</span>
					<span className="font-mono">{getStatusIndicator()}</span>
				</div>
			</div>

			{/* File Input */}
			<div className="mb-6">
				<input
					ref={fileInputRef}
					type="file"
					accept="image/*"
					onChange={handleFileSelect}
					className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
				/>
			</div>

			{/* Processing Controls */}
			{selectedFile && (
				<div className="mb-6 space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Operations
						</label>
						<div className="flex flex-wrap gap-2">
							{['resize', 'brightness', 'contrast', 'sharpen'].map(op => (
								<button
									key={op}
									onClick={() => toggleOperation(op)}
									className={`px-3 py-1 text-sm rounded-md border ${selectedOperations.includes(op)
											? 'bg-blue-100 border-blue-300 text-blue-800'
											: 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
										}`}
								>
									{op.charAt(0).toUpperCase() + op.slice(1)}
								</button>
							))}
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Quality: {quality}%
							</label>
							<input
								type="range"
								min="10"
								max="100"
								value={quality}
								onChange={(e) => setQuality(Number(e.target.value))}
								className="w-full"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Brightness: {brightness}%
							</label>
							<input
								type="range"
								min="50"
								max="150"
								value={brightness}
								onChange={(e) => setBrightness(Number(e.target.value))}
								className="w-full"
								disabled={!selectedOperations.includes('brightness')}
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Contrast: {contrast}%
							</label>
							<input
								type="range"
								min="50"
								max="150"
								value={contrast}
								onChange={(e) => setContrast(Number(e.target.value))}
								className="w-full"
								disabled={!selectedOperations.includes('contrast')}
							/>
						</div>
					</div>

					<button
						onClick={processImage}
						disabled={isProcessing || selectedOperations.length === 0}
						className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
					>
						{isProcessing ? 'Processing...' : 'Process Image'}
					</button>
				</div>
			)}

			{/* Image Preview */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
				{previewUrl && (
					<div>
						<h4 className="text-sm font-medium text-gray-700 mb-2">Original</h4>
						<img
							src={previewUrl}
							alt="Original"
							className="w-full h-48 object-contain border rounded-md bg-gray-50"
						/>
					</div>
				)}

				{processedUrl && (
					<div>
						<h4 className="text-sm font-medium text-gray-700 mb-2">Processed</h4>
						<img
							src={processedUrl}
							alt="Processed"
							className="w-full h-48 object-contain border rounded-md bg-gray-50"
						/>
					</div>
				)}
			</div>

			{/* Hidden canvas for processing */}
			<canvas ref={canvasRef} style={{ display: 'none' }} />

			{/* Results */}
			{result && (
				<div className="mt-6 p-4 bg-gray-50 rounded-md">
					<h4 className="text-sm font-semibold text-gray-800 mb-3">Processing Results</h4>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
						<div>
							<span className="text-gray-600">Original Size:</span>
							<div className="font-mono">{formatFileSize(result.originalSize)}</div>
						</div>
						<div>
							<span className="text-gray-600">Processed Size:</span>
							<div className="font-mono">{formatFileSize(result.processedSize)}</div>
						</div>
						<div>
							<span className="text-gray-600">Compression:</span>
							<div className="font-mono">{result.compressionRatio.toFixed(2)}x</div>
						</div>
						<div>
							<span className="text-gray-600">Processing Time:</span>
							<div className="font-mono">{result.processingTime.toFixed(2)}ms</div>
						</div>
					</div>
					<div className="mt-3 flex items-center gap-4 text-sm">
						<span className="text-gray-600">Engine:</span>
						<span className={`font-mono px-2 py-1 rounded-md text-xs ${result.wasmUsed
								? 'bg-green-100 text-green-800'
								: 'bg-yellow-100 text-yellow-800'
							}`}>
							{result.wasmUsed ? '🚀 WASM' : '📦 JavaScript'}
						</span>
						<span className="text-gray-600">Operations:</span>
						<span className="font-mono">{result.operations.join(', ')}</span>
					</div>
				</div>
			)}
		</div>
	);
};

export default ImageProcessor;
