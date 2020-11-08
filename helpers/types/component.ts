export default interface Component {
	componentName: string;
	el: HTMLElement;
	init: Function;
	destroy: Function;
}
