import Component from '../../../helpers/component';

// https://iamschulz.de/api-proxy:1337?query=https%3A%2F%2Fapi.giphy.com%2Fv1%2Fgifs%2Frandom%3Ftag%3D404%26rating%3DPG-13import Component from '../../../helpers/component';

export default class Giphy extends Component {
    prepare() {
        this.apiProxyUrl = this.el.dataset.giphyApiProxy;
        this.keyword = this.el.dataset.giphyKeyword;
    }

    init() {
        if (!this.apiUrl || !this.keyword) { return; }

        this.getGiphyImage();
    }

    getGiphyImage() {
        const random = Math.floor(Math.random(0,1) * 50) + 1;
        const giphyFetchUrl = `https://api.giphy.com/v1/gifs/search?q=${this.keyword}&limit=1&offset=${random}&rating=PG-13&lang=en`
        const apiFetchUrl = this.apiProxyUrl + encodeURIComponent(giphyFetchUrl);

        fetch(apiFetchUrl)
            .then(response => response.json())
            .then((data) => {
                this.giphyImageUrl = data.data[0].images.original.url;
                this.swapImage();
            });
    }

    swapImage() {
        this.el.src = this.giphyImageUrl;
    }
}
