import "./modal.scss";
import Component from "../../../helpers/component";
import StateMachine from "../../../helpers/stateMachine";
import StateMachineType from "../../../helpers/types/stateMachineInstance";
import eventBusType from "../../../helpers/types/eventBus";
declare const EventBus: eventBusType;
declare const FocusTrap: any;

export default class Modal extends Component {
	StateMachine: StateMachineType;
	closeButton: HTMLButtonElement;
	content: HTMLElement;
	modalContent: string;

	init() {
		this.StateMachine = new StateMachine(this, {
			toggle: {
				value: "closed",
				triggers: [
					{
						name: "closed",
						event: "onModalClose",
						on: "closeModal",
					},
					{
						name: "open",
						event: "onModalOpen",
						on: "openModal",
					},
				],
			},
		});

		this.boundOnModalClose = () => {
			EventBus.publish("onModalClose", this.el);
		};
		EventBus.subscribe("onOverlayClose", this.boundOnModalClose);
		this.closeButton.addEventListener("click", this.boundOnModalClose);

		this.boundOnModalOpen = (payload) => {
			if (!payload || !payload.content) {
				return;
			}

			this.modalContent = payload.content;
			EventBus.publish("onModalOpen", this.el);
		};
		EventBus.subscribe("onModalTrigger", this.boundOnModalOpen);
	}

	boundOnModalOpen(payload: any) {}
	boundOnModalClose() {}

	openModal() {
		this.content.innerHTML = this.modalContent;
		this.el.setAttribute("hidden", "false");
		this.el.setAttribute("aria-hidden", "false");
		FocusTrap.Element = this.el;
	}

	closeModal() {
		this.el.setAttribute("aria-hidden", "true");
		FocusTrap.Element = null;
	}

	destroy() {
		this.closeButton.removeEventListener("click", this.boundOnModalClose);
	}
}
