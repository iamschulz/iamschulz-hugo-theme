import ComponentClass from '../../helpers/component';
import Component from './modal';

jest.mock("./modal.scss", () => {
    return {};
});
document.body.innerHTML = require('../../components/modal/modal.html');
jest.mock('../../helpers/component');

window.EventBus = {
    publish: jest.fn(),
    subscribe: jest.fn()
}

window.FocusTrap = jest.fn();

const StateMachineMock = {
    states: {
        toggle: {
            currentState: 'closed'
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
    component.boundOnModalOpen = jest.fn();
    component.boundOnModalClose = jest.fn();
    component.closeButton = document.querySelector('[data-modal-el="closeButton"]');

    component.init();

    expect(EventBus.subscribe).toHaveBeenCalledWith('onModalTrigger', component.boundOnModalOpen);
    expect(EventBus.subscribe).toHaveBeenCalledWith('onOverlayClose', component.boundOnModalClose);
});

it('can open the modal', () => {
    const states = ['open', 'closed'];
    const component = new Component();
    component.el = document.querySelector('[data-component="modal"]');
    component.StateMachine = StateMachineMock;

    states.forEach(state => {
        component.StateMachine.currentState = state;
        component.openModal();
        expect(component.el.attributes['aria-hidden'].value).toBe('false');
    });
})

it('can close the modal', () => {
    const states = ['open', 'closed'];
    const component = new Component();
    component.el = document.querySelector('[data-component="modal"]');
    component.StateMachine = StateMachineMock;

    states.forEach(state => {
        component.StateMachine.currentState = state;
        component.closeModal();
        expect(component.el.attributes['aria-hidden'].value).toBe('true');
    });
})