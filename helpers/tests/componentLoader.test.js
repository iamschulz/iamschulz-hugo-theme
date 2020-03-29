import ComponentLoader from '../componentLoader';
import Component from '../component';
import IndexComponent from '../../components/index/index';
jest.mock('../../components/index/index.js');

document.body.innerHTML = `
    <div data-component="index"></div>
    <div data-component="index">
        <div data-component="index"></div>
    </div>
`.trim();

window.EventBus = {
    publish: jest.fn(),
    subscribe: jest.fn()
}
window.StateMachine = jest.fn();
window.Modules = {
    index: jest.fn().mockResolvedValue(IndexComponent)
}

const loremElement = document.querySelectorAll('[data-component="index"]')[0]; 
const ipsumElement = document.querySelectorAll('[data-component="index"]')[1]; 
const dolorElement = document.querySelectorAll('[data-component="index"]')[2]; 

beforeEach(() => {
    IndexComponent.mockClear();
})

it('ComponentLoader is constructed', () => {
    const loader = new ComponentLoader();

    loader.updateDom = jest.fn();

    expect(loader.els).toMatchObject({
        0: loremElement,
        1: ipsumElement,
        2: dolorElement,
    });
});

it('registers and boots components', () => {
    const loader = new ComponentLoader();
    loader.registerComponent(loremElement);
    expect(window.Modules.index).toHaveBeenCalledTimes(1);

    return window.Modules.index().then(
        Module => expect(Module).toBe(IndexComponent)
    );
});

it('initializes components', () => {
    const loader = new ComponentLoader();
    expect(loader.lastId).toBe(0);
    loader.initializeComponent(IndexComponent, loremElement);
    loader.initializeComponent(IndexComponent, ipsumElement);
    loader.initializeComponent(IndexComponent, dolorElement);
    expect(loader.lastId).toBe(3);

    expect(IndexComponent).toHaveBeenCalledTimes(3);
});

it('removes (nested) components', () => {
    const loader = new ComponentLoader();
    loader.initializeComponent(IndexComponent, loremElement);
    loader.initializeComponent(IndexComponent, ipsumElement);
    loader.initializeComponent(IndexComponent, dolorElement);
    //console.log("1", loader.components);
    loader.removeComponent(ipsumElement);
    //console.log("2", loader.components);

    //todo: fix test, 2 and 3 are identical and componentObj is undef

    expect(loader.els).toMatchObject({
        0: loremElement
    });
})