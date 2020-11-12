declare const EventBus: any;

export default class Component {
	el: HTMLElement;
	componentName: string;

	constructor(el) {
		this.el = el;
		this.componentName = this.el.dataset.component;
	}

	init() {}

	startComponent() {
		this.assignComponentElements();
		this.init && this.init();
		EventBus && this.publishReady();
	}

	assignComponentElements() {
		const componentDataName = this.componentName
			.match(
				/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g
			)
			.map((x) => x.toLowerCase())
			.join("-"); // convert to kebap-case to select data attribute in DOM

		const componentSelector =
			this.componentName.charAt(0).toLowerCase() +
			this.componentName.slice(1); // convert to camelCase to select within dataset

		Array.from(
			this.el.querySelectorAll(`[data-${componentDataName}-el]`)
		).forEach((componentEl: HTMLElement) => {
			const elementName = componentEl.dataset[`${componentSelector}El`];
			this[elementName] = componentEl;
		});
	}

	publishReady() {
		const eventName = `on${
			this.componentName.charAt(0).toUpperCase() + // convert to camelCase to select within event name
			this.componentName.slice(1)
		}Ready`;

		EventBus.publish(eventName, this.el);
	}
}
