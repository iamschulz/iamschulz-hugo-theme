/**
 * Usage:
 * Create a new HTML and JS file with the same name in ../components/fooBar/fooBar.[html|js]
 * Use following pattern:
 *
 * html:
 *    <div data-component="fooBar">
 *        <span data-foo-bar-el="loremIpsum">
 *            <!-- content here -->
 *        </span>
 *    </div>
 *
 * js:
 *    import Component from '../../helpers/component';
 *    export default class FooBar extends Component {
 *        init() {
 *            // the component wrapper is this.el
 *            // registered DOM elements are assigned like this.loremIpsum
 *            // business logic here
 *        }
 *    }
 *
 */
import ComponentType from "./types/component";
declare const window: any;

interface ComponentLoaderObj {
	id: number;
	component: ComponentType;
}

export default class ComponentLoader {
	components: Array<ComponentLoaderObj>;
	els: NodeList;
	lastId: number;

	constructor() {
		this.components = [];
		this.els = document.querySelectorAll("[data-component]");
		this.lastId = 0;
	}

	updateDom() {
		Array.from(this.els).forEach((el) => {
			if (
				!window.ComponentLoader ||
				window.ComponentLoader.components.filter(
					(x) => x.component.el === el
				).length === 0
			) {
				this.registerComponent(el);
			}
		});
	}

	registerComponent(el) {
		try {
			const componentName = el.dataset.component;
			window.Modules[componentName]()
				.then((Module) => {
					this.initializeComponent(Module.default, el);
				})
				.catch((error) => {
					console.error(
						"Component couldn't be initialized",
						el,
						error
					);
				});
		} catch (error) {
			console.error("Component couldn't be initialized", el, error);
		}
	}

	initializeComponent(Module, el) {
		const id = this.lastId;
		const initializedComponent = new Module(el);

		this.lastId += 1;
		initializedComponent.startComponent();
		this.components.push({
			id,
			component: initializedComponent,
		});
	}

	removeComponent(el) {
		const getCompByEl = (comp) => comp.component.el === el;
		const componentObj = Object.values(this.components).filter(
			getCompByEl
		)[0];

		if (componentObj) {
			if (componentObj.component.destroy) {
				componentObj.component.destroy();
			}

			componentObj.component.el
				.querySelectorAll("[data-component]")
				.forEach((subcomponent) => {
					this.removeComponent(subcomponent);
				});

			delete this.components[componentObj.id];
		}
	}
}
