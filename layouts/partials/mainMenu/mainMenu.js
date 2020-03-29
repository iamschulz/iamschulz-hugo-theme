import Component from '../../../helpers/component';

export default class MainMenu extends Component {
    prepare() {
        this.anchorLinks = this.el.querySelectorAll('a[href^="#"]');

        this.StateMachine = new StateMachine(this, {
            toggle: {
                value: 'closed',
                closed: {
                    event: 'onMenuClose',
                    on: 'toggleA11yHelpers',
                },
                open: {
                    event: 'onMenuOpen',
                    on: 'toggleA11yHelpers',
                },
                fullscreen: {
                    event: 'onMenuViewportLg',
                    on: 'toggleA11yHelpers',
                },
            },
        });
    }

    init() {
        this.boundOnMenuClose = () => { EventBus.publish('onMenuClose', this.el); };
        EventBus.subscribe('onOverlayClose', this.boundOnMenuClose);

        this.boundOnMenuOpen = () => { EventBus.publish('onMenuOpen', this.el); };
        EventBus.subscribe('onMenuToggle', this.boundOnMenuOpen);

        this.boundHandleViewportChanges = (viewport) => { this.handleViewportChanges(viewport); };
        EventBus.subscribe('onViewportChange', this.boundHandleViewportChanges);

        this.closeOnAnchorLink();

        // checkbox exists only to support limited functionality without js
        this.checkbox.remove();
    }

    toggleA11yHelpers() {
        const isShown = this.StateMachine.states.toggle.Value === 'open';
        this.menuList.setAttribute('aria-hidden', !isShown);
        FocusTrap.Element = isShown ? this.menuList : null;
    }

    handleViewportChanges(viewport) {
        if (viewport === 'lg') {
            EventBus.publish('onMenuClose', this.el);
            EventBus.publish('onMenuViewportLg', this.el);
        } else {
            const isOpen = this.StateMachine.states.toggle.Value === 'open';
            EventBus.publish(isOpen ? 'onMenuOpen' : 'onMenuClose', this.el);
        }
    }

    closeOnAnchorLink() {
        this.boundOnMenuClose = () => {
            EventBus.publish('onMenuClose', this.el);
            EventBus.publish('onAnchorLinkClose', this.el);
        };

        Array.from(this.anchorLinks).forEach((anchorLink) => {
            anchorLink.addEventListener('click', this.boundOnMenuClose);
        });
    }
}
