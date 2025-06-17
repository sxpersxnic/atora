import React, { useState, useEffect } from 'react';
import { ComponentProps } from '@/types';
import { initWasm, WasmLinkModule } from '@/lib/wasm';

interface UrlToolsProps extends ComponentProps {
	initialUrl?: string;
	onParse?: (results: UrlParseResults) => void;
}

interface UrlParseResults {
	isValid: boolean;
	domain: string | null;
	path: string | null;
	query: string | null;
	fragment: string | null;
	port: number | null;
	scheme: string | null;
	pathSegments: string[];
}

export default function UrlTools({
	className = "",
	initialUrl = "https://example.com/path?param=value#section",
	onParse
}: UrlToolsProps): React.JSX.Element {
	const [url, setUrl] = useState(initialUrl);
	const [results, setResults] = useState<UrlParseResults | null>(null);
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
	const fallbackParser = {
		validate_url: (url: string) => {
			try {
				new URL(url);
				return true;
			} catch {
				return false;
			}
		},
		get_url_domain: (url: string) => {
			try {
				return new URL(url).hostname;
			} catch {
				return null;
			}
		},
		get_url_path: (url: string) => {
			try {
				return new URL(url).pathname;
			} catch {
				return null;
			}
		},
		get_url_query: (url: string) => {
			try {
				return new URL(url).search.slice(1) || null;
			} catch {
				return null;
			}
		},
		get_url_fragment: (url: string) => {
			try {
				return new URL(url).hash.slice(1) || null;
			} catch {
				return null;
			}
		},
		get_url_port: (url: string) => {
			try {
				const port = new URL(url).port;
				return port ? parseInt(port, 10) : null;
			} catch {
				return null;
			}
		},
		get_url_scheme: (url: string) => {
			try {
				return new URL(url).protocol.slice(0, -1);
			} catch {
				return null;
			}
		},
		get_path_segments: (url: string) => {
			try {
				return new URL(url).pathname.split('/').filter(segment => segment.length > 0);
			} catch {
				return [];
			}
		}
	};

	const parseUrl = async (inputUrl: string): Promise<UrlParseResults> => {
		console.log('UrlTools: Parsing URL:', inputUrl, 'WASM available:', !!wasmModule);

		try {
			if (wasmModule) {
				// Use WASM module for what's available, fallback for the rest
				const isValidUrl = fallbackParser.validate_url(inputUrl);
				console.log('UrlTools: Using WASM+fallback, isValid:', isValidUrl);

				return {
					isValid: isValidUrl,
					domain: fallbackParser.get_url_domain(inputUrl),
					path: fallbackParser.get_url_path(inputUrl),
					query: fallbackParser.get_url_query(inputUrl),
					fragment: fallbackParser.get_url_fragment(inputUrl),
					port: fallbackParser.get_url_port(inputUrl),
					scheme: wasmModule.get_protocol ? wasmModule.get_protocol(inputUrl) : fallbackParser.get_url_scheme(inputUrl),
					pathSegments: fallbackParser.get_path_segments(inputUrl)
				};
			} else {
				// Use fallback implementation
				const pathSegments = fallbackParser.get_path_segments(inputUrl);
				const isValidUrl = fallbackParser.validate_url(inputUrl);
				console.log('UrlTools: Using fallback only, isValid:', isValidUrl);

				return {
					isValid: isValidUrl,
					domain: fallbackParser.get_url_domain(inputUrl),
					path: fallbackParser.get_url_path(inputUrl),
					query: fallbackParser.get_url_query(inputUrl),
					fragment: fallbackParser.get_url_fragment(inputUrl),
					port: fallbackParser.get_url_port(inputUrl),
					scheme: fallbackParser.get_url_scheme(inputUrl),
					pathSegments: Array.isArray(pathSegments) ? pathSegments : []
				};
			}
		} catch (error) {
			console.error('Error parsing URL:', error);
			return {
				isValid: false,
				domain: null,
				path: null,
				query: null,
				fragment: null,
				port: null,
				scheme: null,
				pathSegments: []
			};
		}
	};

	const handleParse = async () => {
		if (!url.trim()) return;

		setLoading(true);
		try {
			const parseResults = await parseUrl(url);
			setResults(parseResults);
			onParse?.(parseResults);
		} catch (error) {
			console.error('Parsing failed:', error);
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
					<label htmlFor="url-parse-input" className="block text-sm font-medium text-gray-700 mb-2">
						URL to Parse
					</label>
					<div className="flex gap-2">
						<input
							id="url-parse-input"
							type="url"
							value={url}
							onChange={handleInputChange}
							placeholder="https://example.com/path?param=value#section"
							className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
						/>
						<button
							onClick={handleParse}
							disabled={loading || !url.trim()}
							className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
						>
							{loading ? 'Parsing...' : 'Parse'}
						</button>
					</div>
				</div>

				{results && (
					<div className="mt-4 p-4 bg-gray-50 rounded-md">
						<h3 className="text-lg font-medium text-gray-900 mb-3">URL Components</h3>

						<div className="space-y-3 text-sm">
							<div className="flex items-center gap-2">
								<span className="font-medium text-gray-600 w-20">Status:</span>
								<span className={`px-2 py-1 rounded text-xs font-medium ${results.isValid
									? 'bg-green-100 text-green-800'
									: 'bg-red-100 text-red-800'
									}`}>
									{results.isValid ? 'Valid URL' : 'Invalid URL'}
								</span>
							</div>

							{results.isValid && (
								<>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
										<div className="flex justify-between">
											<span className="font-medium text-gray-600">Scheme:</span>
											<code className="text-gray-800 bg-white px-2 py-1 rounded text-xs">
												{results.scheme || 'None'}
											</code>
										</div>

										<div className="flex justify-between">
											<span className="font-medium text-gray-600">Domain:</span>
											<code className="text-gray-800 bg-white px-2 py-1 rounded text-xs">
												{results.domain || 'None'}
											</code>
										</div>

										<div className="flex justify-between">
											<span className="font-medium text-gray-600">Port:</span>
											<code className="text-gray-800 bg-white px-2 py-1 rounded text-xs">
												{results.port || 'Default'}
											</code>
										</div>

										<div className="flex justify-between">
											<span className="font-medium text-gray-600">Path:</span>
											<code className="text-gray-800 bg-white px-2 py-1 rounded text-xs max-w-32 truncate">
												{results.path || '/'}
											</code>
										</div>
									</div>

									{results.pathSegments.length > 0 && (
										<div>
											<span className="font-medium text-gray-600 block mb-2">Path Segments:</span>
											<div className="flex flex-wrap gap-1">
												{results.pathSegments.map((segment, index) => (
													<code key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
														{segment}
													</code>
												))}
											</div>
										</div>
									)}

									{results.query && (
										<div>
											<span className="font-medium text-gray-600 block mb-1">Query String:</span>
											<code className="text-xs bg-white p-2 rounded border text-gray-800 block break-all">
												{results.query}
											</code>
										</div>
									)}

									{results.fragment && (
										<div>
											<span className="font-medium text-gray-600 block mb-1">Fragment:</span>
											<code className="text-xs bg-white px-2 py-1 rounded border text-gray-800">
												#{results.fragment}
											</code>
										</div>
									)}
								</>
							)}
						</div>
					</div>
				)}

				<div className="text-xs text-gray-500 mt-4">
					{wasmModule ? (
						<span className="text-green-600">✓ Using WASM-powered URL parsing</span>
					) : (
						<span className="text-yellow-600">⚠ Using JavaScript fallback</span>
					)}
				</div>
			</div>
		</div>
	);
}
