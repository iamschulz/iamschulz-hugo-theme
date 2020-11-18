import Component from "../../../helpers/component";
import { EventBus as eventBusType } from "../../../helpers/types/eventBus";
declare const EventBus: eventBusType;

export default class Search extends Component {
	header: HTMLInputElement;
	background: HTMLInputElement;
	text: HTMLInputElement;
	links: HTMLInputElement;
	addresses: HTMLInputElement;

	init() {
		this.setDDGTheme();
		EventBus.subscribe("onColorSchemeDark", () => {
			this.setDDGTheme();
		});
		EventBus.subscribe("onColorSchemeLight", () => {
			this.setDDGTheme();
		});
	}

	rgbToHex(rgb: Array<number>) {
		return `#${[rgb[0], rgb[1], rgb[2]]
			.map((x) => {
				const hex = x.toString(16);
				return hex.length === 1 ? `0${hex}` : hex;
			})
			.join("")}`;
	}

	getRGBValues(source: string) {
		const bodyStyles = getComputedStyle(document.body);
		return {
			...bodyStyles
				.getPropertyValue(source)
				.match(/\d+/g)
				.map((x) => Number(x)),
		};
	}

	setDDGTheme() {
		this.header.value = this.rgbToHex(
			this.getRGBValues("background-color")
		);
		this.background.value = this.rgbToHex(
			this.getRGBValues("background-color")
		);
		this.text.value = this.rgbToHex(this.getRGBValues("color"));
		this.links.value = this.rgbToHex(this.getRGBValues("color"));
		this.addresses.value = this.rgbToHex(this.getRGBValues("color"));
	}
}
