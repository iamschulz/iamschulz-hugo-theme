import subscriptionsType from "./subscriptions";

export default interface EventBus {
	subscriptions: subscriptionsType;
	lastId: number;
	publish: Function;
	subscribe: Function;
}
