import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react(),
		tailwindcss(),
		dts({
			insertTypesEntry: true,
			copyDtsFiles: true,
			include: ['src/**/*.ts', 'src/**/*.tsx'],
			exclude: ['node_modules', 'dist', 'src/main.tsx', '.storybook', 'src/stories'],
			outDir: 'dist/types',
		}),
	],
	build: {
		lib: {
			entry: resolve(__dirname, 'src/index.ts'),
			name: 'atora',
			formats: ['es', 'umd', 'cjs'],
			fileName: (format) => `index.${format}.js`,
		},
		rollupOptions: {
			external: ['react', 'react-dom'],
			output: {
				assetFileNames: (assetInfo) => {
					if (assetInfo.names.map((name) => name.endsWith('.css')))
						return 'atora.css';
					return '[name][extname]';
				},
				globals: {
					react: 'React',
					'react-dom': 'ReactDOM',
				},
			},
		},
	},
});
