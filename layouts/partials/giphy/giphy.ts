import Component from "../../../helpers/component";

export default class Giphy extends Component {
	el: HTMLImageElement;
	apiProxyUrl: string;
	keyword: string;
	giphyImageUrl: string;

	init() {
		this.apiProxyUrl = this.el.dataset.giphyApiProxy;
		this.keyword = this.el.dataset.giphyKeyword;
		if (!this.apiProxyUrl || !this.keyword) {
			return;
		}
		this.getGiphyImage();
	}

	getGiphyImage() {
		const random = Math.floor(Math.random() * 50) + 1;
		const giphyFetchUrl = `https://api.giphy.com/v1/gifs/search?q=${this.keyword}&limit=1&offset=${random}&rating=PG-13&lang=en`;
		const apiFetchUrl =
			this.apiProxyUrl + encodeURIComponent(giphyFetchUrl);

		fetch(apiFetchUrl)
			.then((response) => response.json())
			.then((data) => {
				this.giphyImageUrl = data.data[0].images.original.url;
				this.swapImage();
			})
			.catch(() => {
				return;
			});
	}

	swapImage() {
		this.el.src = this.giphyImageUrl;
	}
}
