import React, { useState, useEffect } from 'react';
import { ComponentProps } from '@/types';
import { initWasm, WasmLinkModule } from '@/lib/wasm';

interface DataValidatorProps extends ComponentProps {
	initialData?: string;
	onValidate?: (results: ValidationResults) => void;
}

interface ValidationResults {
	isValidEmail: boolean;
	isValidUrl: boolean;
	isValidIpAddress: boolean;
	isValidUuid: boolean;
	isValidJson: boolean;
	isValidCreditCard: boolean;
	isValidPhoneNumber: boolean;
	passwordStrength: number;
	containsSqlInjection: boolean;
	containsXss: boolean;
	dataType: string;
	characterEncoding: string;
	sanitizedData: string;
	securityScore: number;
}

export default function DataValidator({
	className = "",
	initialData = "",
	onValidate
}: DataValidatorProps): React.JSX.Element {
	const [data, setData] = useState(initialData);
	const [results, setResults] = useState<ValidationResults | null>(null);
	const [loading, setLoading] = useState(false);
	const [wasmModule, setWasmModule] = useState<WasmLinkModule | null>(null);

	// Load WASM modules
	useEffect(() => {
		const loadWasm = async () => {
			try {
				const module = await initWasm();
				setWasmModule(module);
				console.log('DataValidator: WASM module loaded successfully');
			} catch (error) {
				console.warn('DataValidator: WASM module not available, using fallback implementation:', error);
				setWasmModule(null);
			}
		};

		loadWasm();
	}, []);

	// Fallback implementations for when WASM is not available
	const fallbackValidator = {
		validateEmail: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
		validateUrl: (url: string) => {
			try {
				new URL(url);
				return true;
			} catch {
				return false;
			}
		},
		validateIpAddress: (ip: string) => {
			const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
			const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
			return ipv4Regex.test(ip) || ipv6Regex.test(ip);
		},
		validateUuid: (uuid: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid),
		validateJson: (json: string) => {
			try {
				JSON.parse(json);
				return true;
			} catch {
				return false;
			}
		},
		validateCreditCard: (cc: string) => {
			const sanitized = cc.replace(/\s+/g, '');
			return /^\d{13,19}$/.test(sanitized);
		},
		validatePhoneNumber: (phone: string) => /^\+?[\d\s\-()]{10,15}$/.test(phone),
		calculatePasswordStrength: (password: string) => {
			let score = 0;
			if (password.length >= 8) score += 20;
			if (password.length >= 12) score += 10;
			if (/[a-z]/.test(password)) score += 15;
			if (/[A-Z]/.test(password)) score += 15;
			if (/\d/.test(password)) score += 15;
			if (/[^a-zA-Z\d]/.test(password)) score += 25;
			return Math.min(score, 100);
		},
		detectSqlInjection: (input: string) => {
			const sqlPatterns = ['union', 'select', 'insert', 'update', 'delete', 'drop', '--', '/*', '*/', 'xp_'];
			const lowercased = input.toLowerCase();
			return sqlPatterns.some(pattern => lowercased.includes(pattern));
		},
		detectXss: (input: string) => {
			const xssPatterns = ['<script', 'javascript:', 'on(load|click|mouseover)', 'eval(', 'alert('];
			const lowercased = input.toLowerCase();
			return xssPatterns.some(pattern => lowercased.includes(pattern));
		},
		detectDataType: (input: string) => {
			if (fallbackValidator.validateEmail(input)) return 'Email';
			if (fallbackValidator.validateUrl(input)) return 'URL';
			if (fallbackValidator.validateIpAddress(input)) return 'IP Address';
			if (fallbackValidator.validateUuid(input)) return 'UUID';
			if (fallbackValidator.validateJson(input)) return 'JSON';
			if (fallbackValidator.validateCreditCard(input)) return 'Credit Card';
			if (fallbackValidator.validatePhoneNumber(input)) return 'Phone Number';
			if (/^\d+$/.test(input)) return 'Number';
			if (/^[a-zA-Z\s]+$/.test(input)) return 'Text';
			return 'Mixed/Unknown';
		},
		sanitizeData: (input: string) => {
			return input
				.replace(/[<>]/g, '')
				.replace(/javascript:/gi, '')
				.replace(/on\w+=/gi, '')
				.trim();
		}
	};

	const validateData = async (inputData: string): Promise<ValidationResults> => {
		console.log('🔍 DataValidator: Starting validation for:', inputData.substring(0, 50) + '...');
		console.log('🔍 DataValidator: WASM module available:', !!wasmModule);

		try {
			if (wasmModule) {
				console.log('✅ DataValidator: Using WASM functions where available');
				// Use WASM module for what's available, fallback for the rest
				const results = {
					isValidEmail: fallbackValidator.validateEmail(inputData),
					isValidUrl: wasmModule.validate_url ? wasmModule.validate_url(inputData) : fallbackValidator.validateUrl(inputData),
					isValidIpAddress: fallbackValidator.validateIpAddress(inputData),
					isValidUuid: fallbackValidator.validateUuid(inputData),
					isValidJson: fallbackValidator.validateJson(inputData),
					isValidCreditCard: fallbackValidator.validateCreditCard(inputData),
					isValidPhoneNumber: fallbackValidator.validatePhoneNumber(inputData),
					passwordStrength: fallbackValidator.calculatePasswordStrength(inputData),
					containsSqlInjection: fallbackValidator.detectSqlInjection(inputData),
					containsXss: fallbackValidator.detectXss(inputData),
					dataType: fallbackValidator.detectDataType(inputData),
					characterEncoding: 'UTF-8', // Could be enhanced with WASM
					sanitizedData: fallbackValidator.sanitizeData(inputData),
					securityScore: 0
				};

				// Calculate security score
				let securityScore = 100;
				if (results.containsSqlInjection) securityScore -= 40;
				if (results.containsXss) securityScore -= 40;
				if (results.passwordStrength < 50 && inputData.length > 5) securityScore -= 20;
				results.securityScore = Math.max(0, securityScore);

				console.log('📊 WASM+Fallback Results:', results);
				return results;
			} else {
				console.log('⚠️ DataValidator: Using JavaScript fallback');
				// Use fallback implementation completely
				const results = {
					isValidEmail: fallbackValidator.validateEmail(inputData),
					isValidUrl: fallbackValidator.validateUrl(inputData),
					isValidIpAddress: fallbackValidator.validateIpAddress(inputData),
					isValidUuid: fallbackValidator.validateUuid(inputData),
					isValidJson: fallbackValidator.validateJson(inputData),
					isValidCreditCard: fallbackValidator.validateCreditCard(inputData),
					isValidPhoneNumber: fallbackValidator.validatePhoneNumber(inputData),
					passwordStrength: fallbackValidator.calculatePasswordStrength(inputData),
					containsSqlInjection: fallbackValidator.detectSqlInjection(inputData),
					containsXss: fallbackValidator.detectXss(inputData),
					dataType: fallbackValidator.detectDataType(inputData),
					characterEncoding: 'UTF-8',
					sanitizedData: fallbackValidator.sanitizeData(inputData),
					securityScore: 0
				};

				// Calculate security score
				let securityScore = 100;
				if (results.containsSqlInjection) securityScore -= 40;
				if (results.containsXss) securityScore -= 40;
				if (results.passwordStrength < 50 && inputData.length > 5) securityScore -= 20;
				results.securityScore = Math.max(0, securityScore);

				console.log('📊 JavaScript Results:', results);
				return results;
			}
		} catch (error) {
			console.error('❌ DataValidator: Error validating data:', error);
			return {
				isValidEmail: false,
				isValidUrl: false,
				isValidIpAddress: false,
				isValidUuid: false,
				isValidJson: false,
				isValidCreditCard: false,
				isValidPhoneNumber: false,
				passwordStrength: 0,
				containsSqlInjection: false,
				containsXss: false,
				dataType: 'Error',
				characterEncoding: 'Unknown',
				sanitizedData: inputData,
				securityScore: 0
			};
		}
	};

	const handleValidate = async () => {
		if (!data.trim()) return;

		setLoading(true);
		try {
			const validationResults = await validateData(data);
			setResults(validationResults);
			onValidate?.(validationResults);
		} catch (error) {
			console.error('Validation failed:', error);
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

	const baseClassName = `
    p-6 border border-gray-200 rounded-lg shadow-sm bg-white
    ${className}
  `.trim();

	return (
		<div className={baseClassName}>
			<div className="space-y-4">
				<div>
					<label htmlFor="data-input" className="block text-sm font-medium text-gray-700 mb-2">
						Data to Validate
					</label>
					<div className="space-y-2">
						<textarea
							id="data-input"
							value={data}
							onChange={handleInputChange}
							placeholder="Enter data to validate (email, URL, JSON, etc.)"
							rows={4}
							className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
						/>
						<div className="flex gap-2">
							<button
								onClick={handleValidate}
								disabled={loading || !data.trim()}
								className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
							>
								{loading ? 'Validating...' : 'Validate Data'}
							</button>
							<button
								onClick={() => setData('test@example.com')}
								className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
							>
								📧 Test Email
							</button>
							<button
								onClick={() => setData('https://example.com/api/v1/users?id=123')}
								className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
							>
								🌐 Test URL
							</button>
							<button
								onClick={() => setData('{"name": "John", "age": 30, "city": "New York"}')}
								className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
							>
								📄 Test JSON
							</button>
						</div>
					</div>
				</div>

				{results && (
					<div className="mt-4 space-y-4">
						{/* Security Score */}
						<div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-md border-l-4 border-blue-500">
							<h3 className="text-lg font-medium text-gray-900 mb-2">🛡️ Security Analysis</h3>
							<div className="flex items-center gap-4">
								<div className="flex-1">
									<div className="flex justify-between text-sm mb-1">
										<span>Security Score</span>
										<span className={`font-bold ${results.securityScore >= 80 ? 'text-green-600' : results.securityScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
											{results.securityScore}/100
										</span>
									</div>
									<div className="w-full bg-gray-200 rounded-full h-2">
										<div
											className={`h-2 rounded-full transition-all duration-300 ${results.securityScore >= 80 ? 'bg-green-500' : results.securityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
											style={{ width: `${results.securityScore}%` }}
										></div>
									</div>
								</div>
								<div className="text-right text-sm space-y-1">
									{results.containsSqlInjection && <div className="text-red-600">⚠️ SQL Injection Risk</div>}
									{results.containsXss && <div className="text-red-600">⚠️ XSS Risk</div>}
									{!results.containsSqlInjection && !results.containsXss && <div className="text-green-600">✅ No threats detected</div>}
								</div>
							</div>
						</div>

						{/* Validation Results */}
						<div className="p-4 bg-gray-50 rounded-md">
							<h3 className="text-lg font-medium text-gray-900 mb-3">📋 Validation Results</h3>
							<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-sm">
								<div className="flex justify-between">
									<span className="font-medium text-gray-600">Email:</span>
									<span className={results.isValidEmail ? 'text-green-600' : 'text-gray-400'}>
										{results.isValidEmail ? '✅' : '❌'}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="font-medium text-gray-600">URL:</span>
									<span className={results.isValidUrl ? 'text-green-600' : 'text-gray-400'}>
										{results.isValidUrl ? '✅' : '❌'}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="font-medium text-gray-600">IP Address:</span>
									<span className={results.isValidIpAddress ? 'text-green-600' : 'text-gray-400'}>
										{results.isValidIpAddress ? '✅' : '❌'}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="font-medium text-gray-600">UUID:</span>
									<span className={results.isValidUuid ? 'text-green-600' : 'text-gray-400'}>
										{results.isValidUuid ? '✅' : '❌'}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="font-medium text-gray-600">JSON:</span>
									<span className={results.isValidJson ? 'text-green-600' : 'text-gray-400'}>
										{results.isValidJson ? '✅' : '❌'}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="font-medium text-gray-600">Credit Card:</span>
									<span className={results.isValidCreditCard ? 'text-green-600' : 'text-gray-400'}>
										{results.isValidCreditCard ? '✅' : '❌'}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="font-medium text-gray-600">Phone:</span>
									<span className={results.isValidPhoneNumber ? 'text-green-600' : 'text-gray-400'}>
										{results.isValidPhoneNumber ? '✅' : '❌'}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="font-medium text-gray-600">Password:</span>
									<span className={`${results.passwordStrength >= 80 ? 'text-green-600' : results.passwordStrength >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
										{results.passwordStrength}%
									</span>
								</div>
							</div>
						</div>

						{/* Data Type and Sanitization */}
						<div className="p-4 bg-gray-50 rounded-md">
							<h3 className="text-lg font-medium text-gray-900 mb-3">🔍 Data Analysis</h3>
							<div className="space-y-2 text-sm">
								<div className="flex justify-between">
									<span className="font-medium text-gray-600">Detected Type:</span>
									<span className="text-gray-800 font-mono">{results.dataType}</span>
								</div>
								<div className="flex justify-between">
									<span className="font-medium text-gray-600">Encoding:</span>
									<span className="text-gray-800 font-mono">{results.characterEncoding}</span>
								</div>
							</div>

							{results.sanitizedData !== data && (
								<div className="mt-3 pt-3 border-t border-gray-200">
									<div className="flex flex-col gap-1">
										<span className="font-medium text-gray-600 text-sm">Sanitized Data:</span>
										<code className="text-sm bg-white px-2 py-1 rounded border text-gray-800 break-all">
											{results.sanitizedData}
										</code>
									</div>
								</div>
							)}
						</div>
					</div>
				)}

				<div className="text-xs text-gray-500 mt-4 flex items-center justify-between">
					<div>
						{wasmModule ? (
							<span className="text-green-600 font-medium">✅ WASM-enhanced validation</span>
						) : (
							<span className="text-yellow-600 font-medium">⚠️ JavaScript fallback mode</span>
						)}
					</div>
					<div className="text-xs text-gray-400">
						Multi-format data validation and security analysis
					</div>
				</div>
			</div>
		</div>
	);
}
