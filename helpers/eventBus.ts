interface Event {
	[key: number]: Function;
	// 1: callback(payload);
}

interface Subscriptions {
	[key: string]: Event;
	// onEventName: Event;
}

export default class EventBus {
	subscriptions: Subscriptions;
	lastId: number;

	constructor() {
		this.subscriptions = {};
		this.lastId = 0;
	}

	subscribe(eventName, callback) {
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

	unsubscribe(eventName, id) {
		if (!eventName || !id) {
			return;
		}

		delete this.subscriptions[eventName][id];
		if (Object.keys(this.subscriptions[eventName]).length === 0) {
			delete this.subscriptions[eventName];
		}
	}

	publish(eventName, arg) {
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
