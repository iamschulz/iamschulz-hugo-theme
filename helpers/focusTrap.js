export default class FocusTrap {
    constructor() {
        this.el = null;
        this.boundOnFocusOut = (event) => { this.onFocusOut(event); };
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
        this.firstFocusableEl = this.el.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        document.addEventListener('focusout', this.boundOnFocusOut);
    }

    onFocusOut(event) {
        if (!this.el.contains(event.relatedTarget)) {
            this.firstFocusableEl.focus();
        }
    }

    unsetFocusTrigger() {
        this.el = null;
        this.firstFocusableEl = null;
        document.removeEventListener('focusout', this.boundOnFocusOut);
    }

    destroy() {
        document.removeEventListener('focusout', this.boundOnFocusOut);
    }
}
