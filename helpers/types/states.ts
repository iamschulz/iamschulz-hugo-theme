export interface StateValue {
	name: string;
	event: string;
	on?: string;
	off?: string;
}

export interface States {
	triggers: Array<StateValue>;
	value?: string;
}
