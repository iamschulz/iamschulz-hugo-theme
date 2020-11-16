import Component from "../../../helpers/component";
import StateMachine from "../../../helpers/stateMachine";
import StateMachineType from "../../../helpers/types/stateMachineInstance";
import { EventBus as eventBusType } from "../../../helpers/types/eventBus";
declare const EventBus: eventBusType;

export default class Overlay extends Component {
	StateMachine: StateMachineType;
	assignedEl: HTMLElement;

	init() {
		this.assignedEl = null;

		this.StateMachine = new StateMachine(this, {
			toggle: {
				value: "closed",
				triggers: [
					{
						name: "closed",
						event: "onOverlayClose",
						on: "publishCloseEvents",
					},
					{
						name: "open",
						event: "onOverlayOpen",
						on: "publishOpenEvents",
					},
				],
			},
		});

		this.handleModal();

		this.boundOnClick = () => {
			this.unassignElement();
			EventBus.publish("onOverlayClose", this.el);
		};
		this.el.addEventListener("click", this.boundOnClick);

		this.boundOnKeyUp = (event) => {
			if (event.key === "Escape") {
				this.unassignElement();
				EventBus.publish("onOverlayClose", this.el);
			}
		};
	}

	boundOnClick() {}
	boundOnKeyUp(event: KeyboardEvent) {}
	boundOnModalOpen(modal: HTMLElement) {}
	modalClosed(modal: HTMLElement) {}

	handleModal() {
		this.boundOnModalOpen = (modal) => {
			this.assignElement(modal);
			EventBus.publish("onOverlayOpen", this.el);
		};
		EventBus.subscribe("onModalOpen", this.boundOnModalOpen);

		this.modalClosed = (modal) => {
			if (this.assignedEl === modal) {
				this.unassignElement();
				EventBus.publish("onOverlayClose", this.el);
			}
		};
		EventBus.subscribe("onModalClose", this.modalClosed);
	}

	publishOpenEvents() {
		EventBus.publish("onDisableScroll");
		document.addEventListener("keyup", this.boundOnKeyUp);
	}

	publishCloseEvents() {
		EventBus.publish("onEnableScroll");
		document.removeEventListener("keyup", this.boundOnKeyUp);
	}

	assignElement(el) {
		this.assignedEl = el;
	}

	unassignElement() {
		this.assignedEl = null;
	}

	destroy() {
		this.unassignElement();
		this.el.removeEventListener("click", this.boundOnClick);
		document.removeEventListener("keyup", this.boundOnKeyUp);
	}
}
