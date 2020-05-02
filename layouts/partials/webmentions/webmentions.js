import Component from '../../../helpers/component';

export default class Webmentions extends Component {
    prepare() {
        this.apiProxyUrl = this.el.dataset.webmentionsApiProxy;
    }

    init() {
        if (!this.apiProxyUrl) { return; }
        this.getWebmentions();
    }

    getWebmentions() {
        const webmentionsFetchUrl = 'https://webmention.io/api/mentions.jf2?domain=next.iamschulz.de';
        const apiFetchUrl = this.apiProxyUrl + encodeURIComponent(webmentionsFetchUrl);

        fetch(apiFetchUrl)
        .then(response => response.json())
        .then((data) => {
            console.log(data)
        });
    }
}
