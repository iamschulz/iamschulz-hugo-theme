import Component from "../../../helpers/component";
import eventBusType from "../../../helpers/types/eventBus";
declare const EventBus: eventBusType;

export default class TableOfContents extends Component {
	links: NodeList;

	init() {
		this.links = this.el.querySelectorAll("a");
		EventBus.subscribe("onHeadlineIntersection", (payload) => {
			this.toggleHeadline(payload);
		});
	}

	toggleHeadline(payload) {
		const thisHeadline = <HTMLElement>(
			Array.from(this.links).find(
				(link: HTMLAnchorElement) => link.hash === `#${payload.el.id}`
			)
		);

		if (thisHeadline) {
			thisHeadline.classList.toggle("is--active", payload.inScreen);
		}
	}
}
