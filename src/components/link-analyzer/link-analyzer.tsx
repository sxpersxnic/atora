import React, { useState, useEffect } from 'react';
import { ComponentProps } from '@/types';
import { initWasm, WasmLinkModule, testWasmVsJavaScript } from '@/lib/wasm';

interface LinkAnalyzerProps extends ComponentProps {
	url?: string;
	onAnalyze?: (results: LinkAnalysisResults) => void;
}

interface LinkAnalysisResults {
	isExternal: boolean;
	isSecure: boolean;
	protocol: string | null;
	isValid: boolean;
	normalized: string;
}

export default function LinkAnalyzer({
	className = "",
	url: initialUrl = "",
	onAnalyze
}: LinkAnalyzerProps): React.JSX.Element {
	const [url, setUrl] = useState(initialUrl);
	const [results, setResults] = useState<LinkAnalysisResults | null>(null);
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
	const fallbackAnalyzer = {
		is_external: (href: string) => href.startsWith('http://') || href.startsWith('https://'),
		is_secure: (url: string) => url.startsWith('https://'),
		get_protocol: (url: string) => {
			const match = url.match(/^([a-z][a-z0-9+.-]*):\/\//);
			return match ? match[1] : null;
		},
		normalize_url: (url: string) => {
			let normalized = url.trim().replace(/\/+$/, '');
			const hashIndex = normalized.indexOf('#');
			if (hashIndex !== -1) {
				normalized = normalized.substring(0, hashIndex);
			}
			return normalized;
		}
	};

	const analyzeUrl = async (inputUrl: string): Promise<LinkAnalysisResults> => {
		console.log('🔍 LinkAnalyzer: Starting analysis for:', inputUrl);
		console.log('🔍 LinkAnalyzer: WASM module available:', !!wasmModule);

		try {
			if (wasmModule) {
				console.log('✅ LinkAnalyzer: Using WASM functions');
				// Use WASM module functions
				const results = {
					isExternal: wasmModule.is_external(inputUrl),
					isSecure: wasmModule.is_secure(inputUrl),
					protocol: wasmModule.get_protocol(inputUrl) || null,
					isValid: !wasmModule.is_internal || !wasmModule.is_internal(inputUrl) || inputUrl.length > 0,
					normalized: wasmModule.normalize_url(inputUrl)
				};
				console.log('📊 WASM Results:', results);
				return results;
			} else {
				console.log('⚠️ LinkAnalyzer: Using JavaScript fallback');
				// Use fallback implementation
				const results = {
					isExternal: fallbackAnalyzer.is_external(inputUrl),
					isSecure: fallbackAnalyzer.is_secure(inputUrl),
					protocol: fallbackAnalyzer.get_protocol(inputUrl),
					isValid: inputUrl.length > 0 && (inputUrl.includes('.') || inputUrl.startsWith('/')),
					normalized: fallbackAnalyzer.normalize_url(inputUrl)
				};
				console.log('📊 JavaScript Results:', results);
				return results;
			}
		} catch (error) {
			console.error('❌ LinkAnalyzer: Error analyzing URL:', error);
			return {
				isExternal: false,
				isSecure: false,
				protocol: null,
				isValid: false,
				normalized: inputUrl
			};
		}
	};

	const handleAnalyze = async () => {
		if (!url.trim()) return;

		setLoading(true);
		try {
			const analysisResults = await analyzeUrl(url);
			setResults(analysisResults);
			onAnalyze?.(analysisResults);
		} catch (error) {
			console.error('Analysis failed:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setUrl(e.target.value);
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
					<label htmlFor="url-input" className="block text-sm font-medium text-gray-700 mb-2">
						URL to Analyze
					</label>
					<div className="flex gap-2">
						<input
							id="url-input"
							type="url"
							value={url}
							onChange={handleInputChange}
							placeholder="https://example.com"
							className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
						/>
						<button
							onClick={handleAnalyze}
							disabled={loading || !url.trim()}
							className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
						>
							{loading ? 'Analyzing...' : 'Analyze'}
						</button>
						<button
							onClick={() => {
								const test = testWasmVsJavaScript(url || 'https://example.com');
								console.log('🧪 WASM Test Results:', test);
								alert(`WASM Test Results:\n${test.comparison}\n\nWASM: ${JSON.stringify(test.wasmResult, null, 2)}\nJS: ${JSON.stringify(test.jsResult, null, 2)}`);
							}}
							className="px-3 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors text-sm"
							title="Test if WASM is actually working"
						>
							🧪 Test WASM
						</button>
					</div>
				</div>

				{results && (
					<div className="mt-4 p-4 bg-gray-50 rounded-md">
						<h3 className="text-lg font-medium text-gray-900 mb-3">Analysis Results</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
							<div className="flex justify-between">
								<span className="font-medium text-gray-600">Type:</span>
								<span className={results.isExternal ? 'text-blue-600' : 'text-green-600'}>
									{results.isExternal ? 'External' : 'Internal'}
								</span>
							</div>

							<div className="flex justify-between">
								<span className="font-medium text-gray-600">Security:</span>
								<span className={results.isSecure ? 'text-green-600' : 'text-orange-600'}>
									{results.isSecure ? 'Secure (HTTPS)' : 'Not Secure'}
								</span>
							</div>

							<div className="flex justify-between">
								<span className="font-medium text-gray-600">Protocol:</span>
								<span className="text-gray-800">
									{results.protocol || 'None detected'}
								</span>
							</div>

							<div className="flex justify-between">
								<span className="font-medium text-gray-600">Valid:</span>
								<span className={results.isValid ? 'text-green-600' : 'text-red-600'}>
									{results.isValid ? 'Yes' : 'No'}
								</span>
							</div>
						</div>

						{results.normalized !== url && (
							<div className="mt-3 pt-3 border-t border-gray-200">
								<div className="flex flex-col gap-1">
									<span className="font-medium text-gray-600 text-sm">Normalized URL:</span>
									<code className="text-sm bg-white px-2 py-1 rounded border text-gray-800 break-all">
										{results.normalized}
									</code>
								</div>
							</div>
						)}
					</div>
				)}

				<div className="text-xs text-gray-500 mt-4 flex items-center justify-between">
					<div>
						{wasmModule ? (
							<span className="text-green-600 font-medium">✅ WASM-powered analysis (Rust)</span>
						) : (
							<span className="text-yellow-600 font-medium">⚠️ JavaScript fallback mode</span>
						)}
					</div>
					<div className="text-xs text-gray-400">
						Click "🧪 Test WASM" to verify WASM is working
					</div>
				</div>
			</div>
		</div>
	);
}
