import Component from '../component';

window.EventBus = {
    publish: jest.fn(),
    subscribe: jest.fn()
}
document.body.innerHTML = `
    <div data-component="testComponent">
        <button data-test-component-el="button"></button>
        <p data-test-component-el="textLoremIpsum">Lorem Ipsum</p>
    </div>
`.trim();
const htmlElement = document.querySelector('div'); 
const htmlButton = document.querySelector('button');
const htmlText = document.querySelector('p');

it('Component is constructed', () => {
    const component = new Component(htmlElement);
    expect(component.el).toBe(htmlElement);
    expect(component.componentName).toBe("testComponent");
});

it('Component is initialized', () => {
    const component = new Component(htmlElement);
    component.assignComponentElements = jest.fn();
    component.prepare = jest.fn();
    component.init = jest.fn();
    component.publishReady = jest.fn();

    component.startComponent();

    expect(component.assignComponentElements).toHaveBeenCalledTimes(1);
    expect(component.prepare).toHaveBeenCalledTimes(1);
    expect(component.init).toHaveBeenCalledTimes(1);
    expect(component.publishReady).toHaveBeenCalledTimes(1);
})

it('registers dom elements', () => {
    const component = new Component(htmlElement);
    component.assignComponentElements();

    expect(component.button).toBe(htmlButton);
    expect(component.textLoremIpsum).toBe(htmlText);
})

it('publishes finish event', () => {
    const component = new Component(htmlElement);
    component.publishReady();

    expect(EventBus.publish).toHaveBeenCalledWith('onTestComponentReady', component.el);
})