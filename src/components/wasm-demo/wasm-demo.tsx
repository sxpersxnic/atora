import React, { useState } from 'react';
import { ComponentProps } from '@/types';
import LinkAnalyzer from '../link-analyzer';
import TextProcessor from '../text-processor';
import UrlTools from '../url-tools';
import { Button } from '../button';

interface WasmDemoProps extends ComponentProps {
	title?: string;
}

export default function WasmDemo({
	className = "",
	title = "WASM-Powered Component Demo"
}: WasmDemoProps): React.JSX.Element {
	const [activeTab, setActiveTab] = useState<'link' | 'text' | 'url'>('link');

	const tabs = [
		{ id: 'link', label: 'Link Analyzer', icon: '🔗' },
		{ id: 'text', label: 'Text Processor', icon: '📝' },
		{ id: 'url', label: 'URL Tools', icon: '🛠️' }
	] as const;

	const baseClassName = `
    max-w-4xl mx-auto p-6 bg-white
    ${className}
  `.trim();

	return (
		<div className={baseClassName}>
			<header className="text-center mb-8">
				<h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
				<p className="text-gray-600 max-w-2xl mx-auto">
					Explore the power of WebAssembly (WASM) with these interactive components.
					Each tool demonstrates high-performance Rust code compiled to WASM, with JavaScript fallbacks.
				</p>
			</header>

			{/* Tab Navigation */}
			<div className="flex flex-wrap justify-center gap-2 mb-8">
				{tabs.map(({ id, label, icon }) => (
					<Button
						key={id}
						label={`${icon} ${label}`}
						onClick={() => setActiveTab(id)}
						className={`
              px-4 py-2 rounded-lg border transition-all duration-200
              ${activeTab === id
								? 'bg-blue-500 text-white border-blue-500 shadow-md'
								: 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
							}
            `}
					/>
				))}
			</div>

			{/* Tab Content */}
			<div className="min-h-96">
				{activeTab === 'link' && (
					<div className="space-y-6">
						<div className="text-center mb-6">
							<h2 className="text-2xl font-semibold text-gray-800 mb-2">🔗 Link Analyzer</h2>
							<p className="text-gray-600">
								Analyze URLs for security, type, and structure using WASM-powered link processing.
							</p>
						</div>
						<LinkAnalyzer
							onAnalyze={(results: unknown) => {
								console.log('Link analysis results:', results);
							}}
						/>
					</div>
				)}

				{activeTab === 'text' && (
					<div className="space-y-6">
						<div className="text-center mb-6">
							<h2 className="text-2xl font-semibold text-gray-800 mb-2">📝 Text Processor</h2>
							<p className="text-gray-600">
								Process and analyze text with word counting, cleaning, slugification, and hashing.
							</p>
						</div>
						<TextProcessor
							onProcess={(results: unknown) => {
								console.log('Text processing results:', results);
							}}
						/>
					</div>
				)}

				{activeTab === 'url' && (
					<div className="space-y-6">
						<div className="text-center mb-6">
							<h2 className="text-2xl font-semibold text-gray-800 mb-2">🛠️ URL Tools</h2>
							<p className="text-gray-600">
								Parse URLs into components including domain, path, query parameters, and fragments.
							</p>
						</div>
						<UrlTools
							onParse={(results: unknown) => {
								console.log('URL parsing results:', results);
							}}
						/>
					</div>
				)}
			</div>

			{/* Performance Info */}
			<footer className="mt-12 pt-8 border-t border-gray-200">
				<div className="bg-blue-50 rounded-lg p-6">
					<h3 className="text-lg font-semibold text-blue-900 mb-3">🚀 Performance Benefits</h3>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
						<div className="flex items-start gap-2">
							<span className="text-blue-500">⚡</span>
							<div>
								<div className="font-medium text-blue-900">Near-Native Speed</div>
								<div className="text-blue-700">WASM runs at near-native performance</div>
							</div>
						</div>
						<div className="flex items-start gap-2">
							<span className="text-blue-500">🔒</span>
							<div>
								<div className="font-medium text-blue-900">Memory Safety</div>
								<div className="text-blue-700">Rust's memory safety guarantees</div>
							</div>
						</div>
						<div className="flex items-start gap-2">
							<span className="text-blue-500">🌐</span>
							<div>
								<div className="font-medium text-blue-900">Cross-Platform</div>
								<div className="text-blue-700">Runs in any modern browser</div>
							</div>
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
}
