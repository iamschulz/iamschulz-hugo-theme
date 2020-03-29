import ComponentClass from '../../helpers/component';
import Component from './header';

document.body.innerHTML = require('../../components/header/header.html');
jest.mock('../../helpers/component');

window.EventBus = {
    publish: jest.fn(),
    subscribe: jest.fn()
}

const StateMachineMock = {
    states: {
        menuButton: {
            value: 'inactive',
            inactive: {},
            active: {},
        },
    }
}

beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    ComponentClass.mockClear();
});

it('Component is called', () => {
    new Component();
    expect(Component).toHaveBeenCalledTimes(1);
});

it('Component is initialized', () => {
    const component = new Component();
    component.boundToggleMenuButton = jest.fn();
    component.menuButton = {
        addEventListener: jest.fn()
    };
    component.menuLabel = {
        removeAttribute: jest.fn()
    };

    component.init();
    expect(component.menuButton.addEventListener).toHaveBeenCalledWith('click', component.boundToggleMenuButton);
    expect(component.menuLabel.removeAttribute).toHaveBeenCalledWith('for');
});

it('toggles menu', () => {
    const component = new Component();
    component.StateMachine = StateMachineMock;
    component.el = document.querySelector('[data-component="header"]');
    component.menuButton = document.querySelector('[data-header-el="menuButton"]');
    
    component.toggleMenuButton();
    expect(EventBus.publish).toHaveBeenCalledWith('onMenuToggle', component.el);
});