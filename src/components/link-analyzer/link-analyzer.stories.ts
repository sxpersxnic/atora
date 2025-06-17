import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import LinkAnalyzer from './link-analyzer';

const meta = {
  title: 'WASM Components/LinkAnalyzer',
  component: LinkAnalyzer,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
A powerful link analyzer component that uses WASM-powered Rust code for high-performance URL analysis. 
Features include:
- External vs internal link detection
- HTTPS security checking
- Protocol extraction
- URL normalization
- Graceful fallback to JavaScript when WASM is unavailable

The component provides real-time analysis with visual feedback on security and link properties.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    url: {
      control: 'text',
      description: 'Initial URL to analyze',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
    onAnalyze: {
      action: 'analyzed',
      description: 'Callback fired when URL analysis completes',
    },
  },
  args: {
    onAnalyze: fn(),
  },
} satisfies Meta<typeof LinkAnalyzer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithHTTPSUrl: Story = {
  args: {
    url: 'https://www.example.com/path/to/page?param=value#section',
  },
  parameters: {
    docs: {
      description: {
        story: 'Analyzing a secure HTTPS URL with path, query parameters, and fragment',
      },
    },
  },
};

export const WithHTTPUrl: Story = {
  args: {
    url: 'http://insecure.example.com/api/data',
  },
  parameters: {
    docs: {
      description: {
        story: 'Analyzing an insecure HTTP URL - shows security warnings',
      },
    },
  },
};

export const WithRelativeUrl: Story = {
  args: {
    url: '/relative/path/to/resource',
  },
  parameters: {
    docs: {
      description: {
        story: 'Analyzing a relative URL - detected as internal link',
      },
    },
  },
};

export const WithComplexUrl: Story = {
  args: {
    url: 'https://user:password@subdomain.example.com:8080/deep/nested/path?query=value&another=param&list[]=1&list[]=2#anchor-point',
  },
  parameters: {
    docs: {
      description: {
        story: 'Complex URL with authentication, subdomain, port, nested path, multiple query parameters, and fragment',
      },
    },
  },
};

export const WithAPIEndpoint: Story = {
  args: {
    url: 'https://api.github.com/repos/owner/repo/issues',
  },
  parameters: {
    docs: {
      description: {
        story: 'Analyzing an API endpoint URL',
      },
    },
  },
};

export const WithCustomStyling: Story = {
  args: {
    url: 'https://tailwindcss.com',
    className: 'border-2 border-blue-500 shadow-lg',
  },
  parameters: {
    docs: {
      description: {
        story: 'LinkAnalyzer with custom border and shadow styling',
      },
    },
  },
};
