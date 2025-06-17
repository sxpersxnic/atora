import { Element, Container } from '../../shared/types';

interface Props extends Container {
	href: string;
}

export default function Link({ href, children }: Props): Element {
	return (
		<a href={href}>{children}</a>
	);
}