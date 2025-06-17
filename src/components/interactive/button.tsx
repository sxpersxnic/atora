import { cva } from 'class-variance-authority';
import React from 'react';
import '../../css/tailwind.css';
import { Element } from '../../shared/types';
import { cn } from '../../shared/util';

const variants = cva(
	'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:cursor-pointer',
	{
		variants: {
			variant: {
				primary: 'bg-control-primary-bg-rest text-control-primary-fg-rest border border-control-primary-border-rest hover:bg-control-primary-bg-hover/90 hover:border-control-primary-border-hover/90 hover:text-control-primary-fg-hover/90',
				secondary: 'bg-control-secondary-bg-rest text-control-secondary-fg-rest border border-control-secondary-border-rest hover:bg-control-secondary-bg-hover/90 hover:border-control-secondary-border-hover/90 hover:text-control-secondary-fg-hover/90',
				default: 'bg-control-default-bg-rest text-control-default-fg-rest border border-control-default-border-rest hover:bg-control-default-bg-hover/90 hover:border-control-default-border-hover/90 hover:text-control-default-fg-hover/90',
				accent: 'bg-control-accent-bg-rest text-control-accent-fg-rest border border-control-accent-border-rest hover:bg-control-accent-bg-hover/90 hover:border-control-defaultaccent-hover/90 hover:text-control-default-accent-hover/90',
				attention: 'bg-control-attention-bg-rest text-control-attention-fg-rest border border-control-attention-border-rest hover:bg-control-attention-bg-hover/90 hover:border-control-attention-border-hover/90 hover:text-control-default-attention-hover/90',
				danger: 'bg-control-danger-bg-rest text-control-danger-fg-rest border border-control-danger-border-rest hover:bg-control-danger-bg-hover/90 hover:border-control-default-danger-hover/90 hover:text-control-default-fg-hover/danger',
			},
			size: {
				default: 'h-10 px-4 py-2',
				sm: 'h-9 rounded-md px-3',
				lg: 'h-11 rounded-md px-8',
				icon: 'h-10 w-10',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
);

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	/** Style variant of the Button */
	variant:
	| 'default'
	| 'primary'
	| 'secondary'
	| 'accent'
	| 'attention'
	| 'danger'
	| null
	| undefined;
	/** Size of the Button */
	size: 'default' | 'sm' | 'lg' | 'icon' | null | undefined;
	/** Label displayed by the Button */
	label: string;
	/** Action to execute when the Button is clicked */
	onClick: () => void;
};

/**
 * Button component
 */
export default function Button({ variant, size, label, onClick }: Props): Element {
	return (
		<button
			className={cn(variants({ variant, size }))}
			type='button'
			onClick={onClick}
		>
			{label}
		</button>
	);
}
