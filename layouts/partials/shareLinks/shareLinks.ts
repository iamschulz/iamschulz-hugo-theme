import Component from "../../../helpers/component";

export default class shareLinks extends Component {
	title: string;
	text: string;
	url: string;
	shareApiLink: HTMLAnchorElement;

	init() {
		this.title = this.el.dataset.shareLinksTitle || "";
		this.text = this.el.dataset.shareLinksText || "";
		this.url = this.el.dataset.shareLinksUrl;

		if (!this.url || !navigator.share) {
			return;
		}

		this.shareApiLink.removeAttribute("hidden");
		this.boundOnClick = (event) => {
			this.onClick(event);
		};
		this.shareApiLink.addEventListener("click", this.boundOnClick);
	}

	boundOnClick(event) {}

	onClick(event) {
		event.preventDefault();

		if (navigator.share) {
			navigator.share({
				title: this.title,
				text: this.text,
				url: this.url,
			});
		}
	}

	destroy() {
		this.shareApiLink.setAttribute("hidden", "hidden");
		this.shareApiLink.removeEventListener("click", this.boundOnClick);
	}
}
