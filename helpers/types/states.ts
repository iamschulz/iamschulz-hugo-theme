import ComponentType from "./component";

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

export interface StatesCollection {
	[key: string]: States;
}

export interface StateMachine {
	component: ComponentType;
	states: States;
	statesConfig: StatesCollection;
}
