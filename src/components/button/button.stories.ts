import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import Button from './button';

const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A customizable button component with support for different states and styles.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes to apply to the button',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
    label: {
      control: 'text',
      description: 'The text label for the button',
    },
    onClick: {
      action: 'clicked',
      description: 'Function called when button is clicked',
    },
  },
  args: {
    onClick: fn(),
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Button',
  },
};

export const Primary: Story = {
  args: {
    label: 'Primary Button',
    className: 'bg-blue-500 hover:bg-blue-600 text-white',
  },
};

export const Secondary: Story = {
  args: {
    label: 'Secondary Button',
    className: 'bg-gray-500 hover:bg-gray-600 text-white',
  },
};

export const Success: Story = {
  args: {
    label: 'Success Button',
    className: 'bg-green-500 hover:bg-green-600 text-white',
  },
};

export const Danger: Story = {
  args: {
    label: 'Danger Button',
    className: 'bg-red-500 hover:bg-red-600 text-white',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Button',
    disabled: true,
  },
};

export const Large: Story = {
  args: {
    label: 'Large Button',
    className: 'px-6 py-3 text-lg bg-purple-500 hover:bg-purple-600 text-white',
  },
};

export const Small: Story = {
  args: {
    label: 'Small Button',
    className: 'px-2 py-1 text-sm bg-indigo-500 hover:bg-indigo-600 text-white',
  },
};

export const Outline: Story = {
  args: {
    label: 'Outline Button',
    className: 'border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white bg-transparent',
  },
};
