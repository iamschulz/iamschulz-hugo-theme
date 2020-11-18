import Component from "../../../helpers/component";
import { EventBus as eventBusType } from "../../../helpers/types/eventBus";
declare const EventBus: eventBusType;

interface paragraphInScreen {
	headline: HTMLElement;
	inScreen: Boolean;
}

export default class Article extends Component {
	el: HTMLElement;
	content: HTMLElement;
	headlines: NodeList;
	elements: HTMLCollection;

	init() {
		this.headlines = this.content.querySelectorAll("h1, h2");
		this.elements = this.content.children;
		this.assignSections();
		this.observeElements();
	}

	assignSections() {
		let headlineIndex = 0;
		Array.from(this.elements).forEach((el: HTMLElement) => {
			const element = el;
			if (Array.from(this.headlines).indexOf(element) >= 0) {
				headlineIndex++;
			}
			element.dataset.articleSectionIndex = String(headlineIndex);
		});
	}

	observeElements() {
		const callback = (entries) => {
			Object.keys(entries).forEach((index) => {
				const thisSectionIndex =
					entries[index].target.dataset.articleSectionIndex;

				const isSectionInScreen =
					entries.filter(
						(entry) =>
							entry.target.dataset.articleSectionIndex ===
								thisSectionIndex &&
							entry.isIntersecting === true
					).length > 0;

				const assignedHeadline = <HTMLElement>(
					Array.from(this.headlines).filter(
						(headline: HTMLElement) =>
							headline.dataset.articleSectionIndex ===
							thisSectionIndex
					)[0]
				);

				this.sendEvent({
					headline: assignedHeadline,
					inScreen: isSectionInScreen,
				});
			});
		};

		const observer = new IntersectionObserver(callback, {
			threshold: [0],
		});

		Object.keys(this.elements).forEach((index) => {
			observer.observe(this.elements[index]);
		});
	}

	sendEvent(payload: paragraphInScreen) {
		if (!payload || !payload.headline) {
			return;
		}

		EventBus.publish("onHeadlineIntersection", {
			el: payload.headline,
			inScreen: payload.inScreen,
		});
	}
}
