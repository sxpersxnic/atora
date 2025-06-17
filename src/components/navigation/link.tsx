import { is_external } from '../../../package/link/link';
import { Element, Container } from '../../shared/types';

interface Props extends Container {
	href: string;
}

export default function Link({ href, children }: Props): Element {
	const external = is_external(href);
	return (
		<a href={href}>{children}</a>
	);
}