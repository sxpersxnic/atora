import React from "react";

export interface Container {
	children: Readonly<React.ReactNode>;
}

export interface Component {
	className?: string;
}

export type Element = React.JSX.Element