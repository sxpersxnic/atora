import type { Meta, StoryObj } from '@storybook/react-vite';
import WasmDemo from './wasm-demo';

const meta = {
  title: 'WASM Components/WasmDemo',
  component: WasmDemo,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
A comprehensive demonstration component showcasing all WASM-powered tools in a unified interface.
This component serves as:
- Interactive playground for testing all WASM components
- Performance comparison between WASM and JavaScript fallbacks
- Educational showcase of WebAssembly capabilities
- Complete user interface with tabbed navigation

Features all three WASM components:
1. **LinkAnalyzer** - URL security and structure analysis
2. **TextProcessor** - Text manipulation and analysis
3. **UrlTools** - Comprehensive URL parsing and breakdown

Perfect for demonstrations, testing, and as a reference implementation.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Custom title for the demo',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<typeof WasmDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const CustomTitle: Story = {
  args: {
    title: 'Advanced WASM Technology Showcase',
  },
  parameters: {
    docs: {
      description: {
        story: 'Demo with a custom title showing the flexibility of the component',
      },
    },
  },
};

export const ProductionDemo: Story = {
  args: {
    title: 'Atora WASM Components - Production Ready',
    className: 'bg-gradient-to-br from-blue-50 to-purple-50',
  },
  parameters: {
    docs: {
      description: {
        story: 'Production-ready demo with gradient background styling',
      },
    },
  },
};

export const CompactDemo: Story = {
  args: {
    title: 'WASM Tools',
    className: 'max-w-3xl',
  },
  parameters: {
    docs: {
      description: {
        story: 'More compact version of the demo with constrained width',
      },
    },
  },
};

export const DarkThemeDemo: Story = {
  args: {
    title: 'WASM Components - Dark Mode',
    className: 'bg-gray-900 text-white',
  },
  parameters: {
    docs: {
      description: {
        story: 'Demo styled for dark mode interface',
      },
    },
  },
};
