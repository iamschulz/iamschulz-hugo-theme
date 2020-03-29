import ComponentClass from '../../helpers/component';
import Component from './colorSchemeToggle';

document.body.innerHTML = require('../../components/colorSchemeToggle/colorSchemeToggle.html');
window.EventBus = {
    publish: jest.fn(),
    subscribe: jest.fn()
}
window.StateMachine = jest.fn();

const { matchMedia } = window;

jest.mock('../../helpers/component');


beforeAll(() => {
    delete window.addEventListener;
    window.addEventListener = jest.fn();

    delete window.matchMedia;
    window.matchMedia = jest.fn().mockImplementation(query => {
        return {
            matches: true,
            media: query,
            onchange: null,
            addListener: jest.fn(), // deprecated
            removeListener: jest.fn(), // deprecated
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            dispatchEvent: jest.fn(),
        };
    });

    delete window.localStorage;
    window.localStorage = {};
});

afterAll(() => {
    window.matchMedia = matchMedia;
})

beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    ComponentClass.mockClear();
});

it('Component is called', () => {
    new Component();
    expect(ComponentClass).toHaveBeenCalledTimes(1);
});

it('Component is initialized', () => {
    const component = new Component();
    component.applyInitialState = jest.fn();
    component.boundOnToggle = jest.fn();
    component.colorSchemeToggle = {
        addEventListener: jest.fn()
    };

    component.prepare();
    component.init();
    expect(window.StateMachine).toHaveBeenCalledTimes(1);
    expect(component.applyInitialState).toHaveBeenCalledTimes(1);
    expect(component.colorSchemeToggle.addEventListener).toHaveBeenCalledWith('change', component.boundOnToggle);
});

it('Applies initial state for dark mode', () => {
    const component = new Component();
    component.colorSchemeToggle = {
        checked: false
    };
    component.onToggle = jest.fn();

    component.applyInitialState();
    expect(component.colorSchemeToggle.checked).toBe(true);

    if (window.localStorage.colorScheme) {
        expect(component.onToggle).toHaveBeenCalledTimes(1);
    }
});

it('toggles dark mode', () => {
    const component = new Component();
    component.colorSchemeToggle = {
        checked: true
    };
    
    component.onToggle();
    expect(EventBus.publish).toHaveBeenCalledWith('onColorSchemeDark');
});