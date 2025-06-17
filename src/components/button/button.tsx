import { ComponentProps } from '@/types';

interface ButtonProps extends ComponentProps {
	label: string;
	onClick: () => void | (() => Promise<void>);
	disabled?: boolean;
};

export default function Button({ className, disabled, label, onClick }: ButtonProps): React.JSX.Element {
	return (
		<button
			className={className ? className : "px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"}
			onClick={onClick}
			disabled={disabled}
			aria-label={label}
			aria-disabled={disabled}
			aria-pressed={disabled ? "false" : "true"}
			aria-selected={disabled ? "false" : "true"}
			aria-busy={disabled ? "true" : "false"}
			aria-controls="button-controls"
			aria-describedby="button-description"
			aria-labelledby="button-label"
			aria-activedescendant="button-active"
			aria-relevant="additions removals"
			aria-orientation="horizontal"
			aria-live="polite"
			aria-atomic="true"
			aria-required="false"
			aria-haspopup="false"
			aria-expanded="false"
			aria-invalid="false"
			aria-hidden="false"
		>
			{label}
		</button>
	);
}