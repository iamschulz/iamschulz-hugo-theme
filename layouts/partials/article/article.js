import Component from '../../../helpers/component';

export default class Article extends Component {
    prepare() {
        this.headlines = this.el.querySelectorAll('h1, h2, h3, h4, h5, h6');
    }

    init() {
        this.observeHeadlines();
    }

    observeHeadlines() {
        const callback = (entries) => {
            Object.keys(entries).forEach((index) => {
                this.sendEvent({
                    el: entries[index].target,
                    inScreen: this.isInScreen(entries[index])
                })
            });
        };

        const observer = new IntersectionObserver(callback, {
            threshold: 0.1,
        });

        Object.keys(this.headlines).forEach((index) => {
            observer.observe(this.headlines[index]);
        });
    }

    sendEvent(payload) {
        EventBus.publish('onHeadlineInScreen', {
            el: payload.el,
            inScreen: payload.inScreen,
        });
    }

    isInScreen(headlineObserver) {
        return headlineObserver.isIntersecting === true 
            && headlineObserver.intersectionRect.top > 0;
    }
}