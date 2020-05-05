import Component from '../../../helpers/component';

export default class Webmentions extends Component {
    prepare() {
        this.apiProxyUrl = this.el.dataset.webmentionsApiProxy;
        this.webmentionsUrl = this.el.dataset.webmentionsUrl;
        this.targetUrl = window.location.href.replace("http://localhost:1313", "https://next.iamschulz.de");
    }

    init() {
        if (!this.apiProxyUrl || !this.webmentionsUrl) { return; }
        this.replyListHTML = "";
        this.getWebmentions();
    }

    getWebmentions() {
        
        const webmentionsFetchUrl = `https://webmention.io/api/mentions.jf2?domain=${this.webmentionsUrl}&target=${this.targetUrl}`;
        const apiFetchUrl = `${this.apiProxyUrl}${encodeURIComponent(webmentionsFetchUrl)}&time=${Date.now()}`;

        fetch(apiFetchUrl)
            .then(response => response.json())
            .then((data) => {
                Array.from(data.children).forEach(reply => this.addReply(reply));
                this.showReplies();
            })
            .catch(() => { this.loader.classList.add('is--hidden'); });
    }

    addReply(replyData) {
        if (!replyData.author || !replyData.author.name) { return; }

        let reply = document.createElement('template');
        reply.innerHTML = this.prototype.outerHTML;
        let replyLink = reply.content.firstChild.querySelector('[data-webmentions-el="link"]');
        let replyAvatar = reply.content.firstChild.querySelector('[data-webmentions-el="avatar"]');
        let replyName = reply.content.firstChild.querySelector('[data-webmentions-el="name"]');
        let replyDate = reply.content.firstChild.querySelector('[data-webmentions-el="date"]');
        let replyContent = reply.content.firstChild.querySelector('[data-webmentions-el="content"]');

        replyName.innerHTML = replyData.author.name;
        if (replyData.author.url) { replyLink.href = replyData.author.url; }
        replyAvatar.src = replyData.author.photo || "";

        const publishDate = replyData.published || replyData['wm-received'];
        replyDate.innerHTML = publishDate
            ? new Date(publishDate).toISOString().slice(0,10).split("-").reverse().join(".")
            : "some time";

        if (!!replyData && replyData['like-of'] === this.targetUrl) {
            replyContent.innerHTML = "<p>like</p>";
        }
        
        if (!!replyData.content && replyData.content.html) {
            console.log("content", replyData.content.html);
            replyContent.innerHTML = replyData.content.html;
        }

        reply.content.firstChild.removeAttribute('hidden');
        this.replyListHTML += reply.content.firstChild.outerHTML;
    }

    showReplies() {
        this.loader.classList.add('is--hidden');
        if (this.replyListHTML.length < 1) { return; }
        this.title.removeAttribute('hidden');
        this.replies.insertAdjacentHTML('beforeend', this.replyListHTML);
    }
}
