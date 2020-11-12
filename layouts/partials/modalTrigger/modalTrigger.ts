import Component from "../../../helpers/component";
import eventBusType from "../../../helpers/types/eventBus";
declare const EventBus: eventBusType;

export default class ModalTrigger extends Component {
	modalId: string;

	init() {
		this.el.removeAttribute("hidden");
		this.modalId = this.el.dataset.modalTriggerTarget;
		if (!this.modalId) {
			return;
		}

		this.boundOnClick = () => {
			EventBus.publish("onModalTrigger", {
				el: this.el,
				content: this.getModalContent(),
			});
		};
		this.el.addEventListener("click", this.boundOnClick);
	}

	boundOnClick() {}

	getModalContent() {
		return document.querySelector(`[data-modal-content="${this.modalId}"]`)
			.innerHTML;
	}
}
