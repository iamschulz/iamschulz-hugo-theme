import eventType from "./event";

export default interface Subscriptions {
	[key: string]: eventType;
	// onEventName: Event;
}
