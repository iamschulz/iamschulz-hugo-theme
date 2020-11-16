import ComponentType from "./types/component";
import { States as StatesType, StateValue } from "./types/states";

declare const EventBus: any;

export default class State {
	name: String;
	el: HTMLElement;
	states: StatesType;
	component: ComponentType;
	currentState: string;

	constructor(name: string, component: ComponentType, state: StatesType) {
		this.name = name;
		this.states = state;
		this.component = component;
		this.currentState = null; //todo: rename to currentStateName

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
		this.states.triggers &&
			this.states.triggers.forEach((trigger) => {
				if (typeof trigger !== "object" || !trigger.event) return;

				EventBus.subscribe(trigger.event, (eventEl) => {
					this.changeState(trigger.name, eventEl);
				});
			});
	}

	changeState(newState: string, eventEl: HTMLElement) {
		if (!newState || newState === this.currentState) {
			return;
		}

		if (!eventEl || this.isThisInstance(eventEl)) {
			this.updateStateValue(newState);
			this.states.triggers &&
				this.triggerStateTransitionMethods(
					this.states.triggers.filter(
						(trigger) => trigger.name === newState
					)[0]
				);
		}
	}

	isThisInstance(eventEl) {
		return eventEl === this.component.el;
	}

	triggerStateTransitionMethods(state: StateValue) {
		if (state && state.on) this.component[state.on]();

		const currentStateObj = this.states.triggers
			? this.states.triggers.filter((trigger) => trigger === state)[0]
			: null;

		if (currentStateObj && currentStateObj.off) {
			this.component[currentStateObj.off]();
		}
	}

	updateStateValue(newState: string) {
		const dataName = this.name.charAt(0).toUpperCase() + this.name.slice(1);
		this.component.el.dataset[`state${dataName}`] = newState;

		this.currentState = newState;
	}
}
