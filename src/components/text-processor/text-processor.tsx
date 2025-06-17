import React, { useState, useEffect } from 'react';
import { ComponentProps } from '@/types';
import { initWasm, WasmLinkModule } from '@/lib/wasm';

interface TextProcessorProps extends ComponentProps {
	initialText?: string;
	onProcess?: (results: ProcessingResults) => void;
}

interface ProcessingResults {
	wordCount: number;
	characterCount: number;
	cleanText: string;
	slugified: string;
	hashValue: string;
}

export default function TextProcessor({
	className = "",
	initialText = "",
	onProcess
}: TextProcessorProps): React.JSX.Element {
	const [text, setText] = useState(initialText);
	const [results, setResults] = useState<ProcessingResults | null>(null);
	const [loading, setLoading] = useState(false);
	const [wasmModule, setWasmModule] = useState<WasmLinkModule | null>(null);

	// Load WASM modules
	useEffect(() => {
		const loadWasm = async () => {
			try {
				const module = await initWasm();
				setWasmModule(module);
				console.log('WASM module loaded successfully');
			} catch (error) {
				console.warn('WASM module not available, using fallback implementation:', error);
				setWasmModule(null);
			}
		};

		loadWasm();
	}, []);

	// Fallback implementations for when WASM is not available
	const fallbackProcessor = {
		count_words: (text: string) => text.trim().split(/\s+/).filter(word => word.length > 0).length,
		count_characters: (text: string) => text.length,
		clean_text: (text: string) => text.replace(/[^\w\s]/gi, '').replace(/\s+/g, ' ').trim(),
		slugify: (text: string) => text
			.toLowerCase()
			.replace(/[^\w\s-]/g, '')
			.replace(/\s+/g, '-')
			.replace(/-+/g, '-')
			.trim(),
		simple_hash: (text: string) => {
			let hash = 0;
			for (let i = 0; i < text.length; i++) {
				const char = text.charCodeAt(i);
				hash = ((hash << 5) - hash) + char;
				hash = hash & hash; // Convert to 32-bit integer
			}
			return Math.abs(hash).toString(16);
		}
	};

	const processText = async (inputText: string): Promise<ProcessingResults> => {
		try {
			if (wasmModule) {
				// Use WASM module when available
				return {
					wordCount: fallbackProcessor.count_words(inputText), // Fallback for now since WASM doesn't have this
					characterCount: wasmModule.count_grapheme_clusters ? wasmModule.count_grapheme_clusters(inputText) : inputText.length,
					cleanText: fallbackProcessor.clean_text(inputText), // Fallback for now
					slugified: fallbackProcessor.slugify(inputText), // Fallback for now
					hashValue: wasmModule.hash_sha256 ? (wasmModule.hash_sha256(inputText) || fallbackProcessor.simple_hash(inputText)) : fallbackProcessor.simple_hash(inputText)
				};
			} else {
				// Use fallback implementation
				return {
					wordCount: fallbackProcessor.count_words(inputText),
					characterCount: fallbackProcessor.count_characters(inputText),
					cleanText: fallbackProcessor.clean_text(inputText),
					slugified: fallbackProcessor.slugify(inputText),
					hashValue: fallbackProcessor.simple_hash(inputText)
				};
			}
		} catch (error) {
			console.error('Error processing text:', error);
			return {
				wordCount: 0,
				characterCount: inputText.length,
				cleanText: inputText,
				slugified: inputText.toLowerCase().replace(/\s+/g, '-'),
				hashValue: 'error'
			};
		}
	};

	const handleProcess = async () => {
		if (!text.trim()) return;

		setLoading(true);
		try {
			const processingResults = await processText(text);
			setResults(processingResults);
			onProcess?.(processingResults);
		} catch (error) {
			console.error('Processing failed:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setText(e.target.value);
		if (results) {
			setResults(null); // Clear results when input changes
		}
	};

	const baseClassName = `
    p-6 border border-gray-200 rounded-lg shadow-sm bg-white
    ${className}
  `.trim();

	return (
		<div className={baseClassName}>
			<div className="space-y-4">
				<div>
					<label htmlFor="text-input" className="block text-sm font-medium text-gray-700 mb-2">
						Text to Process
					</label>
					<textarea
						id="text-input"
						value={text}
						onChange={handleInputChange}
						placeholder="Enter some text to analyze and process..."
						rows={4}
						className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 resize-vertical"
					/>
					<button
						onClick={handleProcess}
						disabled={loading || !text.trim()}
						className="mt-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
					>
						{loading ? 'Processing...' : 'Process Text'}
					</button>
				</div>

				{results && (
					<div className="mt-4 p-4 bg-gray-50 rounded-md">
						<h3 className="text-lg font-medium text-gray-900 mb-3">Processing Results</h3>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
							<div className="space-y-2">
								<div className="flex justify-between">
									<span className="font-medium text-gray-600">Word Count:</span>
									<span className="text-gray-800 font-mono">{results.wordCount}</span>
								</div>

								<div className="flex justify-between">
									<span className="font-medium text-gray-600">Character Count:</span>
									<span className="text-gray-800 font-mono">{results.characterCount}</span>
								</div>

								<div className="flex justify-between">
									<span className="font-medium text-gray-600">Hash Value:</span>
									<span className="text-gray-800 font-mono text-xs">{results.hashValue}</span>
								</div>
							</div>

							<div className="space-y-3">
								<div>
									<span className="font-medium text-gray-600 block mb-1">Cleaned Text:</span>
									<div className="bg-white p-2 rounded border text-gray-800 text-xs max-h-20 overflow-y-auto">
										{results.cleanText || 'No clean text generated'}
									</div>
								</div>

								<div>
									<span className="font-medium text-gray-600 block mb-1">Slugified:</span>
									<code className="bg-white px-2 py-1 rounded border text-gray-800 text-xs block">
										{results.slugified || 'No slug generated'}
									</code>
								</div>
							</div>
						</div>
					</div>
				)}

				<div className="text-xs text-gray-500 mt-4">
					{wasmModule ? (
						<span className="text-green-600">✓ Using WASM-powered text processing</span>
					) : (
						<span className="text-yellow-600">⚠ Using JavaScript fallback</span>
					)}
				</div>
			</div>
		</div>
	);
}
