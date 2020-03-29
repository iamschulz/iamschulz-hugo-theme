import ComponentClass from '../../helpers/component';
import Component from './mainMenu';

document.body.innerHTML = require('../../components/mainMenu/mainMenu.html');
jest.mock('../../helpers/component');

window.EventBus = {
    publish: jest.fn(),
    subscribe: jest.fn()
}

window.FocusTrap = jest.fn();

const StateMachineMock = {
    states: {
        toggle: {
            Value: 'closed'
        }
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
    component.boundOnMenuOpen = jest.fn();
    component.boundOnMenuClose = jest.fn();
    component.boundHandleViewportChanges = jest.fn();
    component.closeOnAnchorLink = jest.fn();
    component.checkbox = {
        remove: jest.fn()
    };

    component.init();

    expect(EventBus.subscribe).toHaveBeenCalledWith('onMenuToggle', component.boundOnMenuOpen);
    expect(EventBus.subscribe).toHaveBeenCalledWith('onOverlayClose', component.boundOnMenuClose);
    expect(EventBus.subscribe).toHaveBeenCalledWith('onViewportChange', component.boundHandleViewportChanges);
    expect(component.checkbox.remove).toHaveBeenCalledTimes(1);
});

it('closes menu and and publishes event on lg viewport change', () =>{
    const viewports = ['sm', 'md', 'lg'];
    const component = new Component();
    component.el = document.querySelector('[data-component="mainMenu"]');
    component.StateMachine = StateMachineMock;

    viewports.forEach(viewport => {
        component.handleViewportChanges(viewport);
        
        if (viewport === "lg") {
            expect(EventBus.publish).toHaveBeenCalledWith('onMenuViewportLg', component.el);
            expect(EventBus.publish).toHaveBeenCalledWith('onMenuClose', component.el);
        } else {
            expect(EventBus.publish).toHaveBeenCalled();
            expect(EventBus.publish).not.toHaveBeenCalledWith('fullscreen');
        }
    });
});

it('can toggle the menu drawer', () => {
    const component = new Component();
    component.menuList = document.querySelector('[data-main-menu-el="menuList"]');
    component.StateMachine = StateMachineMock;

    component.StateMachine.states.toggle.Value = 'open';
    component.toggleA11yHelpers();
    expect(component.menuList.attributes['aria-hidden'].value).toBe('false');

    component.StateMachine.states.toggle.Value = 'closed';
    component.toggleA11yHelpers();
    expect(component.menuList.attributes['aria-hidden'].value).toBe('true');
});