import Component from '../../../helpers/component';

export default class TableOfContents extends Component {
    prepare() {
        this.links = this.el.querySelectorAll('a');
    }

    init() {
        EventBus.subscribe('onHeadlineInScreen', (payload) => { this.toggleHeadline(payload) });
    }

    toggleHeadline(payload) {
        const thisHeadline = Array.from(this.links).find((link) => link.hash === '#' + payload.el.id);
        if (thisHeadline) {
            thisHeadline.classList.toggle('is--active', payload.inScreen);
        }
    }
}