import '../../css/tailwind.css';

interface ButtonProps {
	label: string;
	onClick: () => void;
}

export default function Button({ label, onClick }: ButtonProps) {
	return (
		<button
			type='button'
			onClick={onClick}
			className='rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700'
		>
			{label}
		</button>
	);
}
