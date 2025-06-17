import { defineConfig } from 'tsup';

export default defineConfig({
	entry: ['src/index.ts'],
	format: ['cjs', 'esm'],
	dts: true,
	clean: true,
	sourcemap: true,
	minify: true,
	external: ['react', 'react-dom'],
	esbuildOptions(options) {
		options.banner = {
			js: '"use client"',
		}
	},

	loader: {
		'.wasm': 'file',
	},

	onSuccess: async () => {
		console.log('✅ Build completed successfully!');
	}
})