import Component from '../../../helpers/component';

export default class Overlay extends Component {
    prepare() {
        this.assignedEl = null;

        this.StateMachine = new StateMachine(this, {
            toggle: {
                value: 'closed',
                closed: {
                    event: 'onOverlayClose',
                    on: 'publishCloseEvents',
                },
                open: {
                    event: 'onOverlayOpen',
                    on: 'publishOpenEvents',
                },
            },
        });
    }

    init() {
        this.handleMenu();
        this.handleModal();

        this.boundOnClick = () => {
            this.unassignElement();
            EventBus.publish('onOverlayClose', this.el);
        };
        this.el.addEventListener('click', this.boundOnClick);

        this.boundOnKeyUp = (event) => {
            if (event.keyCode === 27) { // if Esc
                this.unassignElement();
                EventBus.publish('onOverlayClose', this.el);
            }
        };
    }

    handleMenu() {
        this.boundOnMenuOpen = (menu) => {
            this.assignElement(menu);
            EventBus.publish('onOverlayOpen', this.el);
        };
        EventBus.subscribe('onMenuOpen', this.boundOnMenuOpen);

        this.menuClosed = (menu) => {
            if (this.assignedEl === menu) {
                this.unassignElement();
                EventBus.publish('onOverlayClose', this.el);
            }
        };
        EventBus.subscribe('onMenuViewportLg', this.menuClosed);
        EventBus.subscribe('onAnchorLinkClose', this.menuClosed);
    }

    handleModal() {
        this.boundOnModalOpen = (modal) => {
            this.assignElement(modal);
            EventBus.publish('onOverlayOpen', this.el);
        };
        EventBus.subscribe('onModalOpen', this.boundOnModalOpen);

        this.modalClosed = (modal) => {
            if (this.assignedEl === modal) {
                this.unassignElement();
                EventBus.publish('onOverlayClose', this.el);
            }
        };
        EventBus.subscribe('onModalClose', this.menuClosed);
    }

    // eslint-disable-next-line class-methods-use-this
    publishOpenEvents() {
        EventBus.publish('onDisableScroll');
        document.addEventListener('keyup', this.boundOnKeyUp);
    }

    // eslint-disable-next-line class-methods-use-this
    publishCloseEvents() {
        EventBus.publish('onEnableScroll');
        document.removeEventListener('keyup', this.boundOnKeyUp);
    }

    assignElement(el) {
        this.assignedEl = el;
    }

    unassignElement() {
        this.assignedEl = null;
    }
}
