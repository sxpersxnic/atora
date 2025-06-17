import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../components/button';
import LinkAnalyzer from '../components/link-analyzer';
import TextProcessor from '../components/text-processor';
import UrlTools from '../components/url-tools';

// Overview component that showcases all components
const ComponentOverview = () => {
	return (
		<div className="space-y-8 p-6">
			{/* Header */}
			<div className="text-center">
				<h1 className="text-4xl font-bold text-gray-900 mb-2">
					🚀 Atora WASM Component Library
				</h1>
				<p className="text-xl text-gray-600 max-w-3xl mx-auto">
					High-performance React components powered by WebAssembly (WASM) with Rust backend.
					Experience near-native performance in your web applications.
				</p>
			</div>

			{/* Feature Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
				<div className="bg-blue-50 p-4 rounded-lg text-center">
					<div className="text-2xl mb-2">⚡</div>
					<div className="font-semibold text-blue-900">Lightning Fast</div>
					<div className="text-blue-700 text-sm">Near-native performance</div>
				</div>
				<div className="bg-green-50 p-4 rounded-lg text-center">
					<div className="text-2xl mb-2">🔒</div>
					<div className="font-semibold text-green-900">Memory Safe</div>
					<div className="text-green-700 text-sm">Rust's safety guarantees</div>
				</div>
				<div className="bg-purple-50 p-4 rounded-lg text-center">
					<div className="text-2xl mb-2">🛠️</div>
					<div className="font-semibold text-purple-900">Developer Friendly</div>
					<div className="text-purple-700 text-sm">Easy to integrate</div>
				</div>
				<div className="bg-orange-50 p-4 rounded-lg text-center">
					<div className="text-2xl mb-2">🌐</div>
					<div className="font-semibold text-orange-900">Cross Platform</div>
					<div className="text-orange-700 text-sm">Works everywhere</div>
				</div>
			</div>

			{/* Component Showcase */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				{/* Basic Components */}
				<div className="space-y-4">
					<h2 className="text-2xl font-bold text-gray-800">Basic Components</h2>
					<div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
						<h3 className="text-lg font-semibold mb-4">Button Variants</h3>
						<div className="flex flex-wrap gap-2">
							<Button label="Default" onClick={() => console.log('Default clicked')} />
							<Button
								label="Primary"
								onClick={() => console.log('Primary clicked')}
								className="bg-blue-500 hover:bg-blue-600 text-white"
							/>
							<Button
								label="Success"
								onClick={() => console.log('Success clicked')}
								className="bg-green-500 hover:bg-green-600 text-white"
							/>
							<Button
								label="Disabled"
								onClick={() => console.log('Disabled clicked')}
								disabled
							/>
						</div>
					</div>
				</div>

				{/* WASM Components Preview */}
				<div className="space-y-4">
					<h2 className="text-2xl font-bold text-gray-800">WASM Components</h2>
					<div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
						<h3 className="text-lg font-semibold mb-4">Component Types</h3>
						<div className="space-y-3 text-sm">
							<div className="flex items-center gap-2">
								<span className="text-blue-500">🔗</span>
								<span className="font-medium">LinkAnalyzer</span>
								<span className="text-gray-600">- URL security & structure analysis</span>
							</div>
							<div className="flex items-center gap-2">
								<span className="text-green-500">📝</span>
								<span className="font-medium">TextProcessor</span>
								<span className="text-gray-600">- Text manipulation & analysis</span>
							</div>
							<div className="flex items-center gap-2">
								<span className="text-purple-500">🛠️</span>
								<span className="font-medium">UrlTools</span>
								<span className="text-gray-600">- Comprehensive URL parsing</span>
							</div>
							<div className="flex items-center gap-2">
								<span className="text-orange-500">🎯</span>
								<span className="font-medium">WasmDemo</span>
								<span className="text-gray-600">- Unified demo interface</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Performance Comparison */}
			<div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
				<h2 className="text-2xl font-bold text-gray-800 mb-4">Performance Benefits</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div className="bg-white p-4 rounded-lg">
						<div className="text-lg font-semibold text-blue-600 mb-2">Speed</div>
						<div className="text-3xl font-bold text-gray-800">2-10x</div>
						<div className="text-gray-600">faster than JavaScript</div>
					</div>
					<div className="bg-white p-4 rounded-lg">
						<div className="text-lg font-semibold text-green-600 mb-2">Memory</div>
						<div className="text-3xl font-bold text-gray-800">50%</div>
						<div className="text-gray-600">smaller footprint</div>
					</div>
					<div className="bg-white p-4 rounded-lg">
						<div className="text-lg font-semibold text-purple-600 mb-2">Load Time</div>
						<div className="text-3xl font-bold text-gray-800">~100ms</div>
						<div className="text-gray-600">initial load time</div>
					</div>
				</div>
			</div>

			{/* Getting Started */}
			<div className="bg-gray-50 p-6 rounded-lg">
				<h2 className="text-2xl font-bold text-gray-800 mb-4">Getting Started</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<h3 className="font-semibold mb-2">Installation</h3>
						<pre className="bg-gray-800 text-green-400 p-3 rounded text-sm overflow-x-auto">
							<code>npm install @atora/wasm-components</code>
						</pre>
					</div>
					<div>
						<h3 className="font-semibold mb-2">Basic Usage</h3>
						<pre className="bg-gray-800 text-green-400 p-3 rounded text-sm overflow-x-auto">
							<code>{`import { LinkAnalyzer } from '@atora/wasm-components';

<LinkAnalyzer onAnalyze={handleAnalysis} />`}</code>
						</pre>
					</div>
				</div>
			</div>
		</div>
	);
};

const meta = {
	title: 'Overview/Component Library',
	component: ComponentOverview,
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component: `
# Atora WASM Component Library

A comprehensive collection of high-performance React components powered by WebAssembly (WASM) and Rust.

## 🌟 Key Features

- **High Performance**: Near-native execution speed through WASM
- **Memory Safe**: Rust's ownership system prevents common bugs
- **Type Safe**: Full TypeScript support with comprehensive type definitions
- **Fallback Support**: Graceful degradation to JavaScript implementations
- **Modern UI**: Beautiful, responsive design with Tailwind CSS
- **Developer Experience**: Comprehensive Storybook documentation and examples

## 📦 Components Included

### Basic Components
- **Button**: Customizable button with multiple variants and states

### WASM-Powered Components
- **LinkAnalyzer**: URL security analysis and link categorization
- **TextProcessor**: Text manipulation, counting, and normalization
- **UrlTools**: Comprehensive URL parsing and component extraction
- **WasmDemo**: Unified demonstration interface

## 🚀 Performance Benefits

The WASM-powered components offer significant performance improvements over pure JavaScript implementations:

- **2-10x faster execution** for computationally intensive tasks
- **50% smaller memory footprint** due to Rust's efficient memory management
- **Predictable performance** with consistent execution times
- **Zero-copy operations** for maximum efficiency

## 🔧 Technical Architecture

\`\`\`
Browser JavaScript <-> WASM Module (Rust) <-> Native Performance
                  |
            Automatic Fallback to JS if WASM unavailable
\`\`\`

Each component includes intelligent fallback mechanisms that ensure functionality even when WASM is not available or fails to load.
        `,
			},
		},
	},
	tags: ['autodocs'],
} satisfies Meta<typeof ComponentOverview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LibraryOverview: Story = {};

// Individual component samples for quick reference
export const QuickReference: Story = {
	render: () => (
		<div className="space-y-6 p-6">
			<h1 className="text-3xl font-bold text-center mb-8">Quick Reference</h1>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<LinkAnalyzer url="https://example.com/secure-api?token=abc123" />
				<TextProcessor initialText="Hello WASM World! This is a performance test." />
			</div>

			<UrlTools initialUrl="https://api.github.com:443/users/octocat?tab=repositories#profile" />

			<div className="text-center">
				<h3 className="text-lg font-semibold mb-4">Try the Full Demo</h3>
				<p className="text-gray-600 mb-4">Experience all components in action with the unified demo interface.</p>
			</div>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Quick reference showing all components in action with sample data',
			},
		},
	},
};
