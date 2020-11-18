import Component from "../../../helpers/component";
import StateMachine from "../../../helpers/stateMachine";
import { StateMachine as StateMachineType } from "../../../helpers/types/states";
import { EventBus as eventBusType } from "../../../helpers/types/eventBus";
declare const EventBus: eventBusType;

export default class ColorSchemeToggle extends Component {
	StateMachine: StateMachineType;
	colorSchemeToggle: HTMLInputElement;

	init() {
		this.StateMachine = new StateMachine(this, {
			colorScheme: {
				value: window.matchMedia("(prefers-color-scheme:dark)").matches
					? "dark"
					: "light",
				triggers: [
					{
						name: "dark",
						event: "onColorSchemeDark",
					},
					{
						name: "light",
						event: "onColorSchemeLight",
					},
				],
			},
		});

		this.boundOnToggle = () => {
			this.onToggle();
		};
		this.colorSchemeToggle.addEventListener("change", this.boundOnToggle);
		this.applyInitialState();
	}

	boundOnToggle() {}

	onToggle() {
		const colorScheme = this.colorSchemeToggle.checked ? "Dark" : "Light";
		window.localStorage.colorScheme = colorScheme.toLowerCase();
		document
			.querySelector('meta[name="theme-color"]')
			.setAttribute(
				"content",
				colorScheme === "Light" ? "#f1f3f4" : "#0e181b"
			);
		EventBus.publish(`onColorScheme${colorScheme}`);
	}

	applyInitialState() {
		document.body.style.transition = "none";

		if (
			window.localStorage.colorScheme === "dark" ||
			window.localStorage.colorScheme === "light"
		) {
			this.colorSchemeToggle.checked =
				window.localStorage.colorScheme === "dark";
			this.onToggle();
		} else {
			this.colorSchemeToggle.checked = window.matchMedia(
				"(prefers-color-scheme:dark)"
			).matches;
		}

		window.setTimeout(() => {
			document.body.removeAttribute("style");
		}, 0);
	}

	destroy() {
		this.colorSchemeToggle.removeEventListener(
			"change",
			this.boundOnToggle
		);
	}
}
