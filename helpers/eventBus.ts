import { Subscriptions as subscriptionsType } from "./types/eventBus";

export default class EventBus {
	subscriptions: subscriptionsType;
	lastId: number;

	constructor() {
		this.subscriptions = {};
		this.lastId = 0;
	}

	subscribe(eventName: string, callback: Function) {
		if (!eventName || !callback) {
			return;
		}

		const id = this.lastId + 1;
		this.lastId = id;

		if (!this.subscriptions[eventName]) {
			this.subscriptions[eventName] = {};
		}

		this.subscriptions[eventName][id] = callback;

		// pass id to subscriptio call to allow modules to unsubscribe again
		// eslint-disable-next-line consistent-return
		return id;
	}

	unsubscribe(eventName: string, id: number) {
		if (!eventName || !id) {
			return;
		}

		delete this.subscriptions[eventName][id];
		if (Object.keys(this.subscriptions[eventName]).length === 0) {
			delete this.subscriptions[eventName];
		}
	}

	publish(eventName: string, arg: any) {
		if (!eventName) {
			return;
		}

		if (!this.subscriptions[eventName]) {
			return;
		}

		Object.keys(this.subscriptions[eventName]).forEach((key) =>
			this.subscriptions[eventName][key](arg)
		);
	}
}
