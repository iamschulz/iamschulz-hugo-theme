export default class FocusTrap {
	el: HTMLElement;
	firstFocusableEl: HTMLElement;

	constructor() {
		this.el = null;
	}

	set Element(newEl) {
		if (newEl) {
			this.setFocusTrigger(newEl);
		} else {
			this.unsetFocusTrigger();
		}
	}

	setFocusTrigger(newEl) {
		this.el = newEl;
		this.firstFocusableEl = this.el.querySelector(
			'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
		);
		document.addEventListener("focusout", this.onFocusOut);
	}

	onFocusOut(event: FocusEvent) {
		if (!this.el.contains(<HTMLElement>event.relatedTarget)) {
			this.firstFocusableEl.focus();
		}
	}

	unsetFocusTrigger() {
		this.el = null;
		this.firstFocusableEl = null;
		document.removeEventListener("focusout", this.onFocusOut);
	}

	destroy() {
		document.removeEventListener("focusout", this.onFocusOut);
	}
}
