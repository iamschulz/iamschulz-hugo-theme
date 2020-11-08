import StateValueType from "./stateValue";

export default interface States {
	[key: string]: StateValueType;
	value?: any;
}
