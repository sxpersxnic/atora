import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import TextProcessor from './text-processor';

const meta = {
  title: 'WASM Components/TextProcessor',
  component: TextProcessor,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
A comprehensive text processing component powered by WASM-compiled Rust code for optimal performance.
Features include:
- Word and character counting
- Text cleaning and normalization
- URL-friendly slugification
- Hash generation for text fingerprinting
- Real-time processing with visual feedback
- Automatic fallback to JavaScript when WASM is unavailable

Perfect for content management systems, blog platforms, and text analysis tools.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    initialText: {
      control: 'text',
      description: 'Initial text to process',
    },
    className: {
      control: 'text', 
      description: 'Additional CSS classes',
    },
    onProcess: {
      action: 'processed',
      description: 'Callback fired when text processing completes',
    },
  },
  args: {
    onProcess: fn(),
  },
} satisfies Meta<typeof TextProcessor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithSimpleText: Story = {
  args: {
    initialText: 'Hello, World! This is a simple text example.',
  },
  parameters: {
    docs: {
      description: {
        story: 'Processing simple, clean text',
      },
    },
  },
};

export const WithComplexText: Story = {
  args: {
    initialText: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua! 
Ut enim ad minim veniam, quis nostrud exercitation... 
Email: test@example.com | Website: https://example.com`,
  },
  parameters: {
    docs: {
      description: {
        story: 'Processing text with punctuation, line breaks, and mixed content',
      },
    },
  },
};

export const WithSpecialCharacters: Story = {
  args: {
    initialText: 'Special chars: @#$%^&*()_+{}|:"<>?[]\\;\',./ áéíóú ñç 中文 🚀💻🎉',
  },
  parameters: {
    docs: {
      description: {
        story: 'Processing text with special characters, accented letters, unicode, and emojis',
      },
    },
  },
};

export const WithCodeText: Story = {
  args: {
    initialText: `function processText(input: string): ProcessedResult {
  const words = input.split(/\\s+/).filter(word => word.length > 0);
  return {
    wordCount: words.length,
    processed: true
  };
}`,
  },
  parameters: {
    docs: {
      description: {
        story: 'Processing code snippets and technical text',
      },
    },
  },
};

export const WithArticleText: Story = {
  args: {
    initialText: `The Future of WebAssembly in Modern Web Development

WebAssembly (WASM) represents a paradigm shift in web development, offering near-native performance for computationally intensive tasks. This revolutionary technology enables developers to write high-performance code in languages like Rust, C++, and Go, then compile it to run efficiently in web browsers.

Key advantages include:
• Blazing-fast execution speeds
• Memory safety and security
• Language agnostic development
• Seamless JavaScript integration

As we move forward, WASM will likely become the backbone of next-generation web applications, enabling everything from real-time video processing to complex data analytics directly in the browser.`,
  },
  parameters: {
    docs: {
      description: {
        story: 'Processing a full article with headings, paragraphs, and bullet points',
      },
    },
  },
};

export const WithCustomStyling: Story = {
  args: {
    initialText: 'Text with custom styling example',
    className: 'border-2 border-green-500 shadow-lg bg-green-50',
  },
  parameters: {
    docs: {
      description: {
        story: 'TextProcessor with custom green theme styling',
      },
    },
  },
};
