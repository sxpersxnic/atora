import React, { useState, useEffect } from 'react';
import { ComponentProps } from '@/types';
import { initWasm, WasmLinkModule } from '@/lib/wasm';

interface CryptoToolsProps extends ComponentProps {
	initialData?: string;
	onCrypto?: (results: CryptoResults) => void;
}

interface CryptoResults {
	sha256Hash: string;
	md5Hash: string;
	base64Encoded: string;
	base64Decoded: string;
	urlEncoded: string;
	urlDecoded: string;
	uuid: string;
	randomBytes: string;
	timestamp: string;
	entropy: number;
	isBase64Valid: boolean;
	hashComparison: {
		wasmHash: string;
		jsHash: string;
		match: boolean;
		wasmTime: number;
		jsTime: number;
	};
}

export default function CryptoTools({
	className = "",
	initialData = "Hello, WASM Crypto!",
	onCrypto
}: CryptoToolsProps): React.JSX.Element {
	const [data, setData] = useState(initialData);
	const [results, setResults] = useState<CryptoResults | null>(null);
	const [loading, setLoading] = useState(false);
	const [wasmModule, setWasmModule] = useState<WasmLinkModule | null>(null);
	const [selectedOperation, setSelectedOperation] = useState('hash');

	// Load WASM modules
	useEffect(() => {
		const loadWasm = async () => {
			try {
				const module = await initWasm();
				setWasmModule(module);
				console.log('CryptoTools: WASM module loaded successfully');
			} catch (error) {
				console.warn('CryptoTools: WASM module not available, using fallback implementation:', error);
				setWasmModule(null);
			}
		};

		loadWasm();
	}, []);

	// Fallback implementations for when WASM is not available
	const fallbackCrypto = {
		sha256: async (input: string): Promise<string> => {
			if (typeof crypto !== 'undefined' && crypto.subtle) {
				const encoder = new TextEncoder();
				const data = encoder.encode(input);
				const hashBuffer = await crypto.subtle.digest('SHA-256', data);
				const hashArray = Array.from(new Uint8Array(hashBuffer));
				return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
			} else {
				// Simple hash fallback
				let hash = 0;
				for (let i = 0; i < input.length; i++) {
					const char = input.charCodeAt(i);
					hash = ((hash << 5) - hash) + char;
					hash = hash & hash;
				}
				return Math.abs(hash).toString(16).padStart(8, '0');
			}
		},
		md5: (input: string): string => {
			// Simple MD5-like hash (not cryptographically secure)
			let hash = 0;
			for (let i = 0; i < input.length; i++) {
				const char = input.charCodeAt(i);
				hash = ((hash << 5) - hash) + char;
				hash = hash & hash;
			}
			return Math.abs(hash).toString(16).padStart(8, '0') + 'md5sim';
		},
		base64Encode: (input: string): string => {
			if (typeof btoa !== 'undefined') {
				return btoa(input);
			}
			// Manual base64 encoding fallback
			const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
			let result = '';
			let i = 0;
			while (i < input.length) {
				const a = input.charCodeAt(i++);
				const b = i < input.length ? input.charCodeAt(i++) : 0;
				const c = i < input.length ? input.charCodeAt(i++) : 0;
				const bitmap = (a << 16) | (b << 8) | c;
				result += chars.charAt((bitmap >> 18) & 63) +
						  chars.charAt((bitmap >> 12) & 63) +
						  (i - 2 < input.length ? chars.charAt((bitmap >> 6) & 63) : '=') +
						  (i - 1 < input.length ? chars.charAt(bitmap & 63) : '=');
			}
			return result;
		},
		base64Decode: (input: string): string => {
			if (typeof atob !== 'undefined') {
				try {
					return atob(input);
				} catch {
					return 'Invalid Base64';
				}
			}
			return 'Base64 decode not available';
		},
		urlEncode: (input: string): string => encodeURIComponent(input),
		urlDecode: (input: string): string => {
			try {
				return decodeURIComponent(input);
			} catch {
				return 'Invalid URL encoding';
			}
		},
		generateUuid: (): string => {
			if (typeof crypto !== 'undefined' && crypto.randomUUID) {
				return crypto.randomUUID();
			}
			// Fallback UUID generation
			return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
				const r = Math.random() * 16 | 0;
				const v = c === 'x' ? r : (r & 0x3 | 0x8);
				return v.toString(16);
			});
		},
		generateRandomBytes: (length: number = 16): string => {
			if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
				const bytes = new Uint8Array(length);
				crypto.getRandomValues(bytes);
				return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
			}
			// Fallback random bytes
			let result = '';
			for (let i = 0; i < length; i++) {
				result += Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
			}
			return result;
		},
		calculateEntropy: (input: string): number => {
			const freq: Record<string, number> = {};
			for (const char of input) {
				freq[char] = (freq[char] || 0) + 1;
			}
			
			let entropy = 0;
			const length = input.length;
			for (const count of Object.values(freq)) {
				const p = count / length;
				entropy -= p * Math.log2(p);
			}
			return entropy;
		},
		isValidBase64: (input: string): boolean => {
			const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
			return base64Regex.test(input) && input.length % 4 === 0;
		}
	};

	const performCrypto = async (inputData: string): Promise<CryptoResults> => {
		console.log('🔐 CryptoTools: Starting crypto operations for:', inputData.substring(0, 20) + '...');
		console.log('🔐 CryptoTools: WASM module available:', !!wasmModule);

		try {
			// Benchmark hash comparison
			const wasmHashStart = performance.now();
			let wasmHash = '';
			if (wasmModule?.hash_sha256) {
				wasmHash = wasmModule.hash_sha256(inputData) || '';
			}
			const wasmHashTime = performance.now() - wasmHashStart;

			const jsHashStart = performance.now();
			const jsHash = await fallbackCrypto.sha256(inputData);
			const jsHashTime = performance.now() - jsHashStart;

			const results: CryptoResults = {
				sha256Hash: wasmHash || jsHash,
				md5Hash: fallbackCrypto.md5(inputData),
				base64Encoded: fallbackCrypto.base64Encode(inputData),
				base64Decoded: fallbackCrypto.base64Decode(inputData),
				urlEncoded: fallbackCrypto.urlEncode(inputData),
				urlDecoded: fallbackCrypto.urlDecode(inputData),
				uuid: wasmModule?.generate_uuid ? wasmModule.generate_uuid() : fallbackCrypto.generateUuid(),
				randomBytes: fallbackCrypto.generateRandomBytes(16),
				timestamp: new Date().toISOString(),
				entropy: fallbackCrypto.calculateEntropy(inputData),
				isBase64Valid: fallbackCrypto.isValidBase64(inputData),
				hashComparison: {
					wasmHash,
					jsHash,
					match: wasmHash === jsHash,
					wasmTime: wasmHashTime,
					jsTime: jsHashTime
				}
			};

			console.log('🔐 Crypto Results:', results);
			return results;

		} catch (error) {
			console.error('❌ CryptoTools: Error performing crypto operations:', error);
			return {
				sha256Hash: 'Error',
				md5Hash: 'Error',
				base64Encoded: 'Error',
				base64Decoded: 'Error',
				urlEncoded: 'Error',
				urlDecoded: 'Error',
				uuid: 'Error',
				randomBytes: 'Error',
				timestamp: new Date().toISOString(),
				entropy: 0,
				isBase64Valid: false,
				hashComparison: {
					wasmHash: 'Error',
					jsHash: 'Error',
					match: false,
					wasmTime: 0,
					jsTime: 0
				}
			};
		}
	};

	const handleCrypto = async () => {
		if (!data.trim()) return;

		setLoading(true);
		try {
			const cryptoResults = await performCrypto(data);
			setResults(cryptoResults);
			onCrypto?.(cryptoResults);
		} catch (error) {
			console.error('Crypto operations failed:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setData(e.target.value);
		if (results) {
			setResults(null); // Clear results when input changes
		}
	};

	const copyToClipboard = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
		} catch (error) {
			console.error('Failed to copy to clipboard:', error);
		}
	};

	const baseClassName = `
    p-6 border border-gray-200 rounded-lg shadow-sm bg-white
    ${className}
  `.trim();

	return (
		<div className={baseClassName}>
			<div className="space-y-6">
				{/* Header */}
				<div>
					<h2 className="text-xl font-bold text-gray-900 mb-2">🔐 Crypto Tools</h2>
					<p className="text-gray-600 text-sm">
						WASM-powered cryptographic operations and encoding utilities
					</p>
				</div>

				{/* Input */}
				<div className="space-y-4">
					<div>
						<label htmlFor="crypto-input" className="block text-sm font-medium text-gray-700 mb-2">
							Data to Process
						</label>
						<div className="space-y-2">
							<textarea
								id="crypto-input"
								value={data}
								onChange={handleInputChange}
								placeholder="Enter data for cryptographic processing"
								rows={3}
								className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
							/>
							<div className="flex gap-2 flex-wrap">
								<button
									onClick={handleCrypto}
									disabled={loading || !data.trim()}
									className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
								>
									{loading ? 'Processing...' : '🔐 Process Data'}
								</button>
								<button
									onClick={() => setData('Hello, WASM Crypto!')}
									className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
								>
									📝 Sample Text
								</button>
								<button
									onClick={() => setData(fallbackCrypto.generateRandomBytes(32))}
									className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
								>
									🎲 Random Hex
								</button>
								<button
									onClick={() => setData(fallbackCrypto.base64Encode('Test Base64 Data'))}
									className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
								>
									📄 Base64 Sample
								</button>
							</div>
						</div>
					</div>
				</div>

				{/* Results */}
				{results && (
					<div className="space-y-4">
						{/* Performance Comparison */}
						<div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border-l-4 border-purple-500">
							<h3 className="text-lg font-medium text-gray-900 mb-3">⚡ WASM vs JavaScript Performance</h3>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
								<div>
									<div className="text-gray-600">WASM SHA-256</div>
									<div className="font-mono font-medium">
										{results.hashComparison.wasmTime > 0 ? `${results.hashComparison.wasmTime.toFixed(2)}ms` : 'N/A'}
									</div>
								</div>
								<div>
									<div className="text-gray-600">JavaScript SHA-256</div>
									<div className="font-mono font-medium">{results.hashComparison.jsTime.toFixed(2)}ms</div>
								</div>
								<div>
									<div className="text-gray-600">Speed Difference</div>
									<div className={`font-mono font-medium ${
										results.hashComparison.wasmTime > 0 && results.hashComparison.wasmTime < results.hashComparison.jsTime ? 'text-green-600' : 'text-gray-600'
									}`}>
										{results.hashComparison.wasmTime > 0 ? 
											`${(results.hashComparison.jsTime / results.hashComparison.wasmTime).toFixed(2)}x` : 
											'N/A'}
									</div>
								</div>
							</div>
							{results.hashComparison.wasmHash && results.hashComparison.jsHash && (
								<div className="mt-3 text-sm">
									<span className={`px-2 py-1 rounded ${
										results.hashComparison.match ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
									}`}>
										Hash Match: {results.hashComparison.match ? '✅ Yes' : '❌ No'}
									</span>
								</div>
							)}
						</div>

						{/* Hash Results */}
						<div className="p-4 bg-gray-50 rounded-md">
							<h3 className="text-lg font-medium text-gray-900 mb-3">🔐 Hash Functions</h3>
							<div className="space-y-3">
								<div>
									<div className="flex items-center justify-between mb-1">
										<span className="text-sm font-medium text-gray-600">SHA-256:</span>
										<button
											onClick={() => copyToClipboard(results.sha256Hash)}
											className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
										>
											📋 Copy
										</button>
									</div>
									<code className="block text-xs bg-white px-3 py-2 rounded border text-gray-800 break-all font-mono">
										{results.sha256Hash}
									</code>
								</div>
								<div>
									<div className="flex items-center justify-between mb-1">
										<span className="text-sm font-medium text-gray-600">MD5-like:</span>
										<button
											onClick={() => copyToClipboard(results.md5Hash)}
											className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
										>
											📋 Copy
										</button>
									</div>
									<code className="block text-xs bg-white px-3 py-2 rounded border text-gray-800 break-all font-mono">
										{results.md5Hash}
									</code>
								</div>
							</div>
						</div>

						{/* Encoding Results */}
						<div className="p-4 bg-gray-50 rounded-md">
							<h3 className="text-lg font-medium text-gray-900 mb-3">🔤 Encoding & Decoding</h3>
							<div className="space-y-3">
								<div>
									<div className="flex items-center justify-between mb-1">
										<span className="text-sm font-medium text-gray-600">Base64 Encoded:</span>
										<button
											onClick={() => copyToClipboard(results.base64Encoded)}
											className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
										>
											📋 Copy
										</button>
									</div>
									<code className="block text-xs bg-white px-3 py-2 rounded border text-gray-800 break-all font-mono">
										{results.base64Encoded}
									</code>
								</div>
								<div>
									<div className="flex items-center justify-between mb-1">
										<span className="text-sm font-medium text-gray-600">URL Encoded:</span>
										<button
											onClick={() => copyToClipboard(results.urlEncoded)}
											className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
										>
											📋 Copy
										</button>
									</div>
									<code className="block text-xs bg-white px-3 py-2 rounded border text-gray-800 break-all font-mono">
										{results.urlEncoded}
									</code>
								</div>
							</div>
						</div>

						{/* Random Generation */}
						<div className="p-4 bg-gray-50 rounded-md">
							<h3 className="text-lg font-medium text-gray-900 mb-3">🎲 Random Generation</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<div className="flex items-center justify-between mb-1">
										<span className="text-sm font-medium text-gray-600">UUID:</span>
										<button
											onClick={() => copyToClipboard(results.uuid)}
											className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
										>
											📋 Copy
										</button>
									</div>
									<code className="block text-xs bg-white px-3 py-2 rounded border text-gray-800 break-all font-mono">
										{results.uuid}
									</code>
								</div>
								<div>
									<div className="flex items-center justify-between mb-1">
										<span className="text-sm font-medium text-gray-600">Random Bytes (Hex):</span>
										<button
											onClick={() => copyToClipboard(results.randomBytes)}
											className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
										>
											📋 Copy
										</button>
									</div>
									<code className="block text-xs bg-white px-3 py-2 rounded border text-gray-800 break-all font-mono">
										{results.randomBytes}
									</code>
								</div>
							</div>
						</div>

						{/* Analysis */}
						<div className="p-4 bg-gray-50 rounded-md">
							<h3 className="text-lg font-medium text-gray-900 mb-3">📊 Data Analysis</h3>
							<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
								<div>
									<div className="text-gray-600">Data Entropy</div>
									<div className="font-mono font-medium">{results.entropy.toFixed(2)} bits</div>
								</div>
								<div>
									<div className="text-gray-600">Valid Base64</div>
									<div className={results.isBase64Valid ? 'text-green-600' : 'text-red-600'}>
										{results.isBase64Valid ? '✅ Yes' : '❌ No'}
									</div>
								</div>
								<div>
									<div className="text-gray-600">Data Length</div>
									<div className="font-mono font-medium">{data.length} chars</div>
								</div>
								<div>
									<div className="text-gray-600">Timestamp</div>
									<div className="font-mono font-medium text-xs">{results.timestamp.substring(11, 19)}</div>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Status */}
				<div className="text-xs text-gray-500 mt-4 flex items-center justify-between">
					<div>
						{wasmModule ? (
							<span className="text-green-600 font-medium">✅ WASM-enhanced cryptography</span>
						) : (
							<span className="text-yellow-600 font-medium">⚠️ JavaScript fallback mode</span>
						)}
					</div>
					<div className="text-xs text-gray-400">
						Cryptographic operations and encoding utilities
					</div>
				</div>
			</div>
		</div>
	);
}
