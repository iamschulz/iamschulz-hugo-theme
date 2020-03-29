import Component from '../../../helpers/component';

export default class ViewportManager extends Component {
    init() {
        if (!window.getComputedStyle(this.el, ':before').getPropertyValue('content')) {
            console.error('breakpoint check failed');
            return;
        }

        window.requestAnimationFrame(() => {
            this.breakpoint = this.getPropFromCss('viewport');
            this.oldBreakpoint = this.breakpoint;
            this.colorScheme = this.getPropFromCss('scheme');
            this.publishEvent();
        });

        window.addEventListener('resize', () => { this.onViewportResize(); }, false);
    }

    getPropFromCss(propName) {
        return window
            .getComputedStyle(this.el, ':before')
            .getPropertyValue('content')
            .replace(/"| /g, '')
            .split('_')
            .filter((prop) => prop.indexOf(propName) >= 0)[0]
            .split('-')[1];
    }

    onViewportResize() {
        this.oldBreakpoint = this.breakpoint;
        this.breakpoint = this.getPropFromCss('viewport');

        if (this.oldBreakpoint !== this.breakpoint) {
            this.publishEvent();
        }
    }

    publishEvent() {
        this.el.setAttribute('data-breakpoint', this.breakpoint);
        this.el.setAttribute('data-color-scheme', this.colorScheme);
        EventBus.publish('onViewportChange', this.breakpoint);
    }
}
