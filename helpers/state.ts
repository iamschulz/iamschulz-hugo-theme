import ComponentType from "./types/component";
import StatesType from "./types/states";

declare const EventBus: any;

export default class State {
	name: String;
	el: HTMLElement;
	states: StatesType;
	component: ComponentType;
	currentState: any;

	constructor(name, component, state) {
		this.name = name;
		this.states = state;
		this.component = component;
		this.currentState = null;

		this.addEventMethods();

		// wait for all StateMachines to be registered, then initialize everything
		window.setTimeout(() => {
			this.Update = this.states.value;
		});
	}

	set Update(newState) {
		this.changeState(newState, this.el);
	}

	get Value() {
		return this.currentState;
	}

	get States() {
		return this.states;
	}

	addEventMethods() {
		Object.keys(this.states).forEach((index) => {
			const state = this.states[index];
			if (typeof state !== "object" || !state.event) return;

			EventBus.subscribe(state.event, (eventEl) => {
				this.changeState(index, eventEl);
			});
		});
	}

	changeState(newState, eventEl) {
		if (!newState || newState === this.currentState) {
			return;
		}

		if (!eventEl || this.isThisInstance(eventEl)) {
			this.updateStateValue(newState);
			this.triggerStateTransitionMethods(this.states[newState]);
		}
	}

	isThisInstance(eventEl) {
		return eventEl === this.component.el;
	}

	triggerStateTransitionMethods(state) {
		if (state && state.on) this.component[state.on]();
		if (
			this.states[this.currentState] &&
			this.states[this.currentState].off
		) {
			this.component[this.states[this.currentState].off]();
		}
	}

	updateStateValue(newState) {
		const dataName = this.name.charAt(0).toUpperCase() + this.name.slice(1);
		this.component.el.dataset[`state${dataName}`] = newState;

		this.currentState = newState;
	}
}
