import Component from '../../../helpers/component';

export default class Webmentions extends Component {
    prepare() {
        this.apiProxyUrl = this.el.dataset.webmentionsApiProxy;
        this.webmentionsUrl = this.el.dataset.webmentionsUrl;
    }

    init() {
        if (!this.apiProxyUrl || !this.webmentionsUrl) { return; }
        this.replyListHTML = "";
        this.getWebmentions();
    }

    getWebmentions() {
        const targetUrl = window.location.href.replace("http://localhost:1313", "https://next.iamschulz.de");
        const webmentionsFetchUrl = `https://webmention.io/api/mentions.jf2?domain=${this.webmentionsUrl}&target=${targetUrl}`;
        const apiFetchUrl = `${this.apiProxyUrl}${encodeURIComponent(webmentionsFetchUrl)}&time=${Date.now()}`;

        fetch(apiFetchUrl)
            .then(response => response.json())
            .then((data) => {
                Array.from(data.children).forEach(reply => this.addReply(reply));
                this.showReplies();
            });
    }

    addReply(replyData) {
        if (!replyData.content.html || !replyData.author.name) { return; }

        let reply = document.createElement('template');
        reply.innerHTML = this.prototype.outerHTML;
        let replyLink = reply.content.firstChild.querySelector('[data-webmentions-el="link"]');
        let replyAvatar = reply.content.firstChild.querySelector('[data-webmentions-el="avatar"]');
        let replyName = reply.content.firstChild.querySelector('[data-webmentions-el="name"]');
        let replyDate = reply.content.firstChild.querySelector('[data-webmentions-el="date"]');
        let replyContent = reply.content.firstChild.querySelector('[data-webmentions-el="content"]');

        replyName.innerHTML = replyData.author.name;
        replyContent.innerHTML = replyData.content.html;
        if (replyData.author.url) { replyLink.href = replyData.author.url; }
        replyAvatar.src = replyData.author.photo || "";
        replyDate.innerHTML = replyData.published
            ? new Date(replyData.published).toISOString().slice(0,10).split("-").reverse().join(".")
            : "some time";

        reply.content.firstChild.removeAttribute('hidden');
        this.replyListHTML += reply.content.firstChild.outerHTML;
    }

    showReplies() {
        this.loader.classList.add('is--hidden');
        this.replies.insertAdjacentHTML('beforeend', this.replyListHTML);
    }
}
