import ComponentClass from '../../../helpers/component';
import Component from '../body';

document.body.innerHTML = require('../../components/index/index.html');
jest.mock('../../helpers/component');

window.StateMachine = jest.fn();

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

    component.init();
    expect(window.StateMachine).toHaveBeenCalledTimes(1);
});