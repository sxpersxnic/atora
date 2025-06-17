import type { StorybookConfig } from '@storybook/react-vite'
import { resolve } from 'path'

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-essentials",
    "@storybook/addon-onboarding",
    "@storybook/addon-interactions",
    "@storybook/addon-links",
    "@storybook/addon-themes"
  ],
  "framework": {
    "name": "@storybook/react-vite",
    "options": {}
  },
	"docs": {
		"autodocs": "tag"
	},
	viteFinal: async (config) => {
		// Add path aliases
		config.resolve = config.resolve || {};
		config.resolve.alias = {
			...config.resolve.alias,
			'@': resolve(__dirname, '../src'),
			'@/components': resolve(__dirname, '../src/components'),
			'@/utils': resolve(__dirname, '../src/utils'),
			'@/types': resolve(__dirname, '../src/types'),
			'@/wasm': resolve(__dirname, '../src/wasm'),
		};

		// Add WASM support
		config.assetsInclude = ['**/*.wasm'];

		return config;
	},
};

export default config;