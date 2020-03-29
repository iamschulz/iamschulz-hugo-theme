import Component from '../../../helpers/component';

export default class Header extends Component {
    prepare() {
        this.StateMachine = new StateMachine(this, {
            menuButton: {
                value: 'inactive',
                inactive: {},
                active: {},
            },
        });
    }

    init() {
        this.boundToggleMenuButton = () => { this.toggleMenuButton(); };
        this.menuButton.addEventListener('click', this.boundToggleMenuButton);
        this.menuLabel.removeAttribute('for');

        this.boundOnMenuClose = () => { this.onMenuClose(); };
        EventBus.subscribe('onOverlayClose', this.boundOnMenuClose);
    }

    toggleMenuButton() {
        EventBus.publish('onMenuToggle', this.el);
        EventBus.publish('onToggleMenuButton', this.el);
        this.StateMachine.states.menuButton.Update = 'active';
        this.toggleAriaAttr();
    }

    onMenuClose() {
        this.StateMachine.states.menuButton.Update = 'inactive';
        this.toggleAriaAttr();
    }

    toggleAriaAttr() {
        this.menuButton.setAttribute('aria-expanded', this.StateMachine.states.menuButton.Value === 'active');
    }
}
