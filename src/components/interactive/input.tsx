import { cva } from "class-variance-authority";
import { Element } from "../../shared/types";

const variants = cva(
	'',
	{
		variants: {
			variant: {
				default: 'bg-control-default-bg-rest text-control-default-fg-rest border border-control-default-border-rest hover:bg-control-default-bg-hover/90 hover:border-control-default-border-hover/90 hover:text-control-default-fg-hover/90',
			},
			size: {
				default: 'h-10 px-4 py-2',
			}
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		}
	}
)

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
	/** Style variant of the Input */
	variant: 'default' | null | undefined;
	/** Label displayed by the Input */
	label?: string;
	/** Placeholder text displayed by the Input */
	placeholder: string;
	/** Action to execute when the Input is clicked */
	onChange: () => void;
}

/**
 * TextInput component
 */
export function TextInput({ variant, label, placeholder, onChange, ...props }: Props): Element {
	return (
		<div className="flex flex-col">
			{label && <label className="text-sm font-medium" htmlFor={label}>{label}</label>}
			<input
				className={variants({ variant })}
				type="text"
				name={label ?? 'TextInput'}
				placeholder={placeholder}
				onChange={onChange}
				aria-label={label}
				aria-placeholder={placeholder}
				aria-required={props.required}
				aria-labelledby={label ?? 'TextInput'}
				aria-readonly={props.readOnly}
				aria-hidden={props.hidden}
			/>
		</div>
	);
}


/**
 * PasswordInput component
 */
export function PasswordInput({ variant, label, placeholder, onChange, ...props }: Props): Element {
	return (
		<div className="flex flex-col">
			{label && <label className="text-sm font-medium" htmlFor={label}>{label}</label>}
			<input
				className={variants({ variant })}
				type="password"
				name={label ?? 'PasswordInput'}
				placeholder={placeholder}
				onChange={onChange}
				aria-label={label}
				aria-placeholder={placeholder}
				aria-required={props.required}
				aria-labelledby={label ?? 'PasswordInput'}
				aria-readonly={props.readOnly}
				aria-hidden={props.hidden}
			/>
		</div>
	);
}