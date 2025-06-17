import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import UrlTools from './url-tools';

const meta = {
  title: 'WASM Components/UrlTools',
  component: UrlTools,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
Advanced URL parsing and manipulation component powered by WASM-compiled Rust code.
Features comprehensive URL analysis including:
- URL validation and structure verification
- Domain, path, and scheme extraction
- Query parameter and fragment parsing
- Port number detection
- Path segment breakdown
- Real-time parsing with detailed component visualization
- Graceful JavaScript fallback when WASM is unavailable

Ideal for URL manipulation tools, API testing interfaces, and web development utilities.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    initialUrl: {
      control: 'text',
      description: 'Initial URL to parse',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
    onParse: {
      action: 'parsed',
      description: 'Callback fired when URL parsing completes',
    },
  },
  args: {
    onParse: fn(),
  },
} satisfies Meta<typeof UrlTools>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const SimpleHTTPSUrl: Story = {
  args: {
    initialUrl: 'https://www.example.com',
  },
  parameters: {
    docs: {
      description: {
        story: 'Parsing a simple HTTPS URL with domain only',
      },
    },
  },
};

export const ComplexUrl: Story = {
  args: {
    initialUrl: 'https://api.example.com:8080/v2/users/123/profile?include=posts&format=json&limit=10#bio-section',
  },
  parameters: {
    docs: {
      description: {
        story: 'Complex URL with subdomain, custom port, nested path, multiple query parameters, and fragment',
      },
    },
  },
};

export const URLWithAuthentication: Story = {
  args: {
    initialUrl: 'https://username:password@secure.example.com:443/dashboard',
  },
  parameters: {
    docs: {
      description: {
        story: 'URL containing authentication credentials (note: not recommended for production)',
      },
    },
  },
};

export const FileProtocolUrl: Story = {
  args: {
    initialUrl: 'file:///Users/developer/projects/myapp/index.html',
  },
  parameters: {
    docs: {
      description: {
        story: 'Local file protocol URL with absolute path',
      },
    },
  },
};

export const FTPUrl: Story = {
  args: {
    initialUrl: 'ftp://files.example.com:21/public/downloads/file.zip',
  },
  parameters: {
    docs: {
      description: {
        story: 'FTP protocol URL with custom port and file path',
      },
    },
  },
};

export const MailtoUrl: Story = {
  args: {
    initialUrl: 'mailto:support@example.com?subject=Help%20Request&body=I%20need%20assistance',
  },
  parameters: {
    docs: {
      description: {
        story: 'Mailto URL with encoded subject and body parameters',
      },
    },
  },
};

export const WebSocketUrl: Story = {
  args: {
    initialUrl: 'wss://websocket.example.com:443/chat/room/123?auth=token456',
  },
  parameters: {
    docs: {
      description: {
        story: 'Secure WebSocket URL with path and authentication token',
      },
    },
  },
};

export const LocalhostDevelopment: Story = {
  args: {
    initialUrl: 'http://localhost:3000/api/v1/health?debug=true',
  },
  parameters: {
    docs: {
      description: {
        story: 'Local development server URL with API endpoint',
      },
    },
  },
};

export const URLWithSpecialCharacters: Story = {
  args: {
    initialUrl: 'https://example.com/search?q=hello%20world&lang=es&category=tech%26science',
  },
  parameters: {
    docs: {
      description: {
        story: 'URL with encoded special characters and complex query parameters',
      },
    },
  },
};

export const InvalidUrl: Story = {
  args: {
    initialUrl: 'not-a-valid-url-format',
  },
  parameters: {
    docs: {
      description: {
        story: 'Testing with an invalid URL format to demonstrate validation',
      },
    },
  },
};

export const WithCustomStyling: Story = {
  args: {
    initialUrl: 'https://storybook.js.org/docs/react/get-started/introduction',
    className: 'border-2 border-purple-500 shadow-lg bg-purple-50',
  },
  parameters: {
    docs: {
      description: {
        story: 'UrlTools with custom purple theme styling',
      },
    },
  },
};
