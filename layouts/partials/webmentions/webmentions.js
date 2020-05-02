import Component from '../../../helpers/component';

export default class Webmentions extends Component {
    prepare() {
        this.apiProxyUrl = this.el.dataset.webmentionsApiProxy;
    }

    init() {
        if (!this.apiProxyUrl) { return; }
        this.replyListHTML = "";
        this.getWebmentions();
    }

    getWebmentions() {
        const webmentionsFetchUrl = 'https://webmention.io/api/mentions.jf2?domain=next.iamschulz.de';
        const apiFetchUrl = this.apiProxyUrl + encodeURIComponent(webmentionsFetchUrl);

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
        replyLink.href = replyData.author.url || "";
        replyAvatar.src = replyData.author.photo || "";
        replyDate.innerHTML = replyData.published || "some time";

        reply.content.firstChild.removeAttribute('hidden');
        this.replyListHTML += reply.content.firstChild.outerHTML;
    }

    showReplies() {
        this.loader.setAttribute('hidden', 'hidden');
        this.replies.insertAdjacentHTML('beforeend', this.replyListHTML);
    }
}
