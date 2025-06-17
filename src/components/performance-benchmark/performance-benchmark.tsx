import React, { useState, useEffect } from 'react';
import { ComponentProps } from '@/types';
import { initWasm, WasmLinkModule } from '@/lib/wasm';

interface PerformanceBenchmarkProps extends ComponentProps {
	onBenchmark?: (results: BenchmarkResults) => void;
}

interface BenchmarkResults {
	wasmTime: number;
	jsTime: number;
	speedupFactor: number;
	operations: number;
	wasmOpsPerSecond: number;
	jsOpsPerSecond: number;
	testType: string;
	dataSize: number;
	winner: 'WASM' | 'JavaScript' | 'Tie';
	memoryUsage: number;
}

interface BenchmarkTest {
	name: string;
	description: string;
	operations: number;
	dataSize: number;
	wasmFunction?: (data: string, iterations: number) => number;
	jsFunction: (data: string, iterations: number) => number;
}

export default function PerformanceBenchmark({
	className = "",
	onBenchmark
}: PerformanceBenchmarkProps): React.JSX.Element {
	const [results, setResults] = useState<BenchmarkResults[]>([]);
	const [loading, setLoading] = useState(false);
	const [wasmModule, setWasmModule] = useState<WasmLinkModule | null>(null);
	const [selectedTest, setSelectedTest] = useState('text-processing');
	const [iterations, setIterations] = useState(10000);

	// Load WASM modules
	useEffect(() => {
		const loadWasm = async () => {
			try {
				const module = await initWasm();
				setWasmModule(module);
				console.log('PerformanceBenchmark: WASM module loaded successfully');
			} catch (error) {
				console.warn('PerformanceBenchmark: WASM module not available:', error);
				setWasmModule(null);
			}
		};

		loadWasm();
	}, []);

	// Benchmark tests
	const benchmarkTests: Record<string, BenchmarkTest> = {
		'text-processing': {
			name: 'Text Processing',
			description: 'Character counting and text manipulation',
			operations: iterations,
			dataSize: 1000,
			wasmFunction: (data: string, iter: number) => {
				if (!wasmModule?.count_grapheme_clusters) return 0;
				const start = performance.now();
				for (let i = 0; i < iter; i++) {
					wasmModule.count_grapheme_clusters(data);
				}
				return performance.now() - start;
			},
			jsFunction: (data: string, iter: number) => {
				const start = performance.now();
				let result = 0;
				for (let i = 0; i < iter; i++) {
					result = data.length; // Simple character count
				}
				// Use result to prevent lint warning
				console.log('Character count result:', result);
				return performance.now() - start;
			}
		},
		'url-validation': {
			name: 'URL Validation',
			description: 'URL parsing and validation',
			operations: iterations,
			dataSize: 500,
			wasmFunction: (data: string, iter: number) => {
				if (!wasmModule?.is_external) return 0;
				const start = performance.now();
				for (let i = 0; i < iter; i++) {
					wasmModule.is_external(data);
				}
				return performance.now() - start;
			},
			jsFunction: (data: string, iter: number) => {
				const start = performance.now();
				let result = false;
				for (let i = 0; i < iter; i++) {
					result = data.startsWith('http://') || data.startsWith('https://');
				}
				// Use result to prevent lint warning
				console.log('URL validation result:', result);
				return performance.now() - start;
			}
		},
		'hash-computation': {
			name: 'Hash Computation',
			description: 'SHA-256 hashing operations',
			operations: iterations / 10, // Fewer iterations for heavy operations
			dataSize: 2000,
			wasmFunction: (data: string, iter: number) => {
				if (!wasmModule?.hash_sha256) return 0;
				const start = performance.now();
				for (let i = 0; i < iter; i++) {
					wasmModule.hash_sha256(data);
				}
				return performance.now() - start;
			},
			jsFunction: (data: string, iter: number) => {
				// Simple JS hash fallback
				const simpleHash = (str: string) => {
					let hash = 0;
					for (let i = 0; i < str.length; i++) {
						const char = str.charCodeAt(i);
						hash = ((hash << 5) - hash) + char;
						hash = hash & hash;
					}
					return Math.abs(hash).toString(16);
				};
				
				const start = performance.now();
				for (let i = 0; i < iter; i++) {
					simpleHash(data);
				}
				return performance.now() - start;
			}
		},
		'string-manipulation': {
			name: 'String Manipulation',
			description: 'Complex string operations',
			operations: iterations,
			dataSize: 1500,
			jsFunction: (data: string, iter: number) => {
				const start = performance.now();
				for (let i = 0; i < iter; i++) {
					data.toLowerCase()
						.replace(/[^\w\s]/g, '')
						.replace(/\s+/g, '-')
						.trim();
				}
				return performance.now() - start;
			}
		},
		'protocol-extraction': {
			name: 'Protocol Extraction',
			description: 'URL protocol parsing',
			operations: iterations,
			dataSize: 300,
			wasmFunction: (data: string, iter: number) => {
				if (!wasmModule?.get_protocol) return 0;
				const start = performance.now();
				for (let i = 0; i < iter; i++) {
					wasmModule.get_protocol(data);
				}
				return performance.now() - start;
			},
			jsFunction: (data: string, iter: number) => {
				const start = performance.now();
				let result: string | null = null;
				for (let i = 0; i < iter; i++) {
					const match = data.match(/^([a-z][a-z0-9+.-]*):\/\//);
					result = match ? match[1] : null;
				}
				// Use result to prevent lint warning
				console.log('Protocol extraction result:', result);
				return performance.now() - start;
			}
		}
	};

	const generateTestData = (size: number): string => {
		const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ';
		let result = '';
		
		if (selectedTest === 'url-validation' || selectedTest === 'protocol-extraction') {
			return 'https://example.com/api/v1/users?id=123&name=test';
		}
		
		for (let i = 0; i < size; i++) {
			result += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		return result;
	};

	const runBenchmark = async () => {
		const test = benchmarkTests[selectedTest];
		if (!test) return;

		setLoading(true);
		
		try {
			// Give the UI time to update
			await new Promise(resolve => setTimeout(resolve, 100));
			
			const testData = generateTestData(test.dataSize);
			const testIterations = test.operations;
			
			console.log(`🏁 Running benchmark: ${test.name}`);
			console.log(`📊 Iterations: ${testIterations}, Data size: ${test.dataSize}`);
			
			// Force garbage collection if available
			const windowWithGc = window as { gc?: () => void };
			if (windowWithGc.gc) {
				windowWithGc.gc();
			}
			
			const performanceWithMemory = performance as { memory?: { usedJSHeapSize: number } };
			const memoryBefore = performanceWithMemory.memory?.usedJSHeapSize || 0;
			
			// Run JavaScript benchmark
			const jsTime = test.jsFunction(testData, testIterations);
			
			// Run WASM benchmark (if available)
			let wasmTime = 0;
			if (wasmModule && test.wasmFunction) {
				// Small delay between tests
				await new Promise(resolve => setTimeout(resolve, 50));
				wasmTime = test.wasmFunction(testData, testIterations);
			}
			
			const memoryAfter = performanceWithMemory.memory?.usedJSHeapSize || 0;
			const memoryUsage = memoryAfter - memoryBefore;
			
			// Calculate results
			const wasmOpsPerSecond = wasmTime > 0 ? (testIterations / wasmTime) * 1000 : 0;
			const jsOpsPerSecond = jsTime > 0 ? (testIterations / jsTime) * 1000 : 0;
			const speedupFactor = wasmTime > 0 ? jsTime / wasmTime : 0;
			
			let winner: 'WASM' | 'JavaScript' | 'Tie' = 'Tie';
			if (wasmTime > 0 && jsTime > 0) {
				const threshold = 0.05; // 5% threshold for "tie"
				if (speedupFactor > (1 + threshold)) winner = 'WASM';
				else if (speedupFactor < (1 - threshold)) winner = 'JavaScript';
			} else if (wasmTime === 0) {
				winner = 'JavaScript';
			}
			
			const benchmarkResult: BenchmarkResults = {
				wasmTime,
				jsTime,
				speedupFactor,
				operations: testIterations,
				wasmOpsPerSecond,
				jsOpsPerSecond,
				testType: test.name,
				dataSize: test.dataSize,
				winner,
				memoryUsage
			};
			
			console.log('📈 Benchmark Results:', benchmarkResult);
			
			setResults(prev => [benchmarkResult, ...prev.slice(0, 9)]); // Keep last 10 results
			onBenchmark?.(benchmarkResult);
			
		} catch (error) {
			console.error('Benchmark failed:', error);
		} finally {
			setLoading(false);
		}
	};

	const clearResults = () => {
		setResults([]);
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
					<h2 className="text-xl font-bold text-gray-900 mb-2">⚡ Performance Benchmark</h2>
					<p className="text-gray-600 text-sm">
						Compare WASM vs JavaScript performance across different operations
					</p>
				</div>

				{/* Controls */}
				<div className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Test Type
							</label>
							<select
								value={selectedTest}
								onChange={(e) => setSelectedTest(e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
							>
								{Object.entries(benchmarkTests).map(([key, test]) => (
									<option key={key} value={key}>
										{test.name}
									</option>
								))}
							</select>
						</div>
						
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Iterations
							</label>
							<select
								value={iterations}
								onChange={(e) => setIterations(Number(e.target.value))}
								className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
							>
								<option value={1000}>1,000</option>
								<option value={5000}>5,000</option>
								<option value={10000}>10,000</option>
								<option value={50000}>50,000</option>
								<option value={100000}>100,000</option>
							</select>
						</div>
						
						<div className="flex items-end gap-2">
							<button
								onClick={runBenchmark}
								disabled={loading}
								className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
							>
								{loading ? 'Running...' : '🏁 Run Test'}
							</button>
							<button
								onClick={clearResults}
								className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
							>
								🗑️
							</button>
						</div>
					</div>
					
					{/* Test Description */}
					{benchmarkTests[selectedTest] && (
						<div className="p-3 bg-blue-50 rounded-md border-l-4 border-blue-500">
							<p className="text-sm text-blue-800">
								<strong>{benchmarkTests[selectedTest].name}:</strong> {benchmarkTests[selectedTest].description}
							</p>
						</div>
					)}
				</div>

				{/* Results */}
				{results.length > 0 && (
					<div className="space-y-4">
						<h3 className="text-lg font-medium text-gray-900">📊 Benchmark Results</h3>
						
						{/* Latest Result - Highlighted */}
						{results[0] && (
							<div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border-2 border-blue-200">
								<div className="flex items-center justify-between mb-3">
									<h4 className="font-semibold text-gray-900">{results[0].testType} (Latest)</h4>
									<div className={`px-3 py-1 rounded-full text-sm font-medium ${
										results[0].winner === 'WASM' ? 'bg-green-100 text-green-800' :
										results[0].winner === 'JavaScript' ? 'bg-blue-100 text-blue-800' :
										'bg-gray-100 text-gray-800'
									}`}>
										🏆 {results[0].winner} Wins
									</div>
								</div>
								
								<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
									<div>
										<div className="text-gray-600">WASM Time</div>
										<div className="font-mono font-medium">
											{results[0].wasmTime > 0 ? `${results[0].wasmTime.toFixed(2)}ms` : 'N/A'}
										</div>
									</div>
									<div>
										<div className="text-gray-600">JS Time</div>
										<div className="font-mono font-medium">{results[0].jsTime.toFixed(2)}ms</div>
									</div>
									<div>
										<div className="text-gray-600">Speedup</div>
										<div className={`font-mono font-medium ${
											results[0].speedupFactor > 1 ? 'text-green-600' : 
											results[0].speedupFactor < 1 ? 'text-red-600' : 'text-gray-600'
										}`}>
											{results[0].speedupFactor > 0 ? `${results[0].speedupFactor.toFixed(2)}x` : 'N/A'}
										</div>
									</div>
									<div>
										<div className="text-gray-600">Operations/sec</div>
										<div className="font-mono font-medium text-xs">
											WASM: {results[0].wasmOpsPerSecond > 0 ? Math.round(results[0].wasmOpsPerSecond).toLocaleString() : 'N/A'}<br/>
											JS: {Math.round(results[0].jsOpsPerSecond).toLocaleString()}
										</div>
									</div>
								</div>
							</div>
						)}
						
						{/* Historical Results */}
						{results.length > 1 && (
							<div className="space-y-2">
								<h4 className="text-md font-medium text-gray-700">Previous Results</h4>
								<div className="space-y-2 max-h-60 overflow-y-auto">
									{results.slice(1).map((result, index) => (
										<div key={index} className="p-3 bg-gray-50 rounded-md">
											<div className="flex items-center justify-between">
												<span className="text-sm font-medium text-gray-900">{result.testType}</span>
												<div className="flex items-center gap-4 text-xs text-gray-600">
													<span>WASM: {result.wasmTime > 0 ? `${result.wasmTime.toFixed(1)}ms` : 'N/A'}</span>
													<span>JS: {result.jsTime.toFixed(1)}ms</span>
													<span className={`px-2 py-1 rounded ${
														result.winner === 'WASM' ? 'bg-green-100 text-green-700' :
														result.winner === 'JavaScript' ? 'bg-blue-100 text-blue-700' :
														'bg-gray-100 text-gray-700'
													}`}>
														{result.winner}
													</span>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				)}

				{/* Status */}
				<div className="text-xs text-gray-500 mt-4 flex items-center justify-between">
					<div>
						{wasmModule ? (
							<span className="text-green-600 font-medium">✅ WASM available for benchmarking</span>
						) : (
							<span className="text-yellow-600 font-medium">⚠️ WASM not available - JS only mode</span>
						)}
					</div>
					<div className="text-xs text-gray-400">
						Performance may vary based on browser and system
					</div>
				</div>
			</div>
		</div>
	);
}
