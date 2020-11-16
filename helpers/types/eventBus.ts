export interface Event {
	[key: number]: Function;
	// 1: callback(payload);
}

export interface Subscriptions {
	[key: string]: Event;
	// onEventName: Event;
}

export interface EventBus {
	subscriptions: Subscriptions;
	lastId: number;
	publish: Function;
	subscribe: Function;
}
