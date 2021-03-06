import Component from "../../../helpers/component";
import "./replaceIframe.scss";

export default class ReplaceIframe extends Component {
	id: string;
	iframe: HTMLIFrameElement;

	init() {
		try {
			this.id = this.el.dataset.replaceIframeTriggerTarget;
			this.iframe = document.querySelector(
				`[data-iframe-replace-id="${this.id}"]`
			);
		} catch (error) {
			console.error("couldn't initialize embed", this.el, error);
			return;
		}

		this.el.addEventListener("click", (event) => {
			event.preventDefault();
			this.showElement();
		});
	}

	showElement() {
		const { src } = this.iframe.dataset;
		this.iframe.setAttribute("src", src);
		this.iframe.removeAttribute("hidden");
		this.el.setAttribute("hidden", "true");
	}
}
