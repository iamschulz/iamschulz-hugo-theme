import Component from "../../../helpers/component";

export default class Reactions extends Component {
	apiProxyUrl: string;
	webmentionsUrl: string;
	devId: string;
	targetUrl: string;
	replies: Array<any>; // todo: refactor into object<timestamp:htmlElement>
	fetches: Array<Promise<void>>;
	likes: number;
	devCommentCounter: number;
	wmCommentCounter: number;
	prototype: HTMLElement;
	loader: HTMLElement;
	replyList: HTMLElement;
	repliesTitle: HTMLElement;
	likesCounter: HTMLElement;
	likesTitle: HTMLElement;

	init() {
		this.apiProxyUrl = this.el.dataset.reactionsApiProxy;
		this.webmentionsUrl = this.el.dataset.webmentionsUrl;
		this.devId = this.el.dataset.reactionsDevId;
		this.targetUrl = window.location.href;

		if (!this.apiProxyUrl) {
			return;
		}
		this.replies = [];
		this.likes = 0;
		this.fetches = [];

		if (this.devId) {
			this.fetches.push(this.getDevLikes());
		}
		if (this.devId) {
			this.fetches.push(this.getDevComments());
		}
		if (this.webmentionsUrl) {
			this.fetches.push(this.getWebmentions());
		}

		if (this.fetches.length < 1) {
			this.showReplies();
			this.showLikes();
		} else {
			Promise.all(this.fetches)
				.then(() => {
					this.showReplies();
					this.showLikes();
				})
				.catch(() => {
					this.showReplies();
					this.showLikes();
				});
		}
	}

	getDevComments() {
		this.devCommentCounter = 0;
		const apiFetchUrl = `https://dev.to/api/comments?a_id=${this.devId}`;

		return fetch(apiFetchUrl)
			.then((response) => response.json())
			.then((data) => {
				Array.from(data).forEach((reply) => this.addDevReply(reply));
				this.devCommentCounter++;
			})
			.catch(() => {
				return;
			});
	}

	getDevLikes() {
		const apiFetchUrl = `https://dev.to/api/articles/${this.devId}`;

		return fetch(apiFetchUrl)
			.then((response) => response.json())
			.then((data) => {
				this.likes += data.positive_reactions_count;
			})
			.catch(() => {
				return;
			});
	}

	getWebmentions() {
		this.wmCommentCounter = 0;
		const webmentionsFetchUrl = `https://webmention.io/api/mentions.jf2?domain=${this.webmentionsUrl}&target=${this.targetUrl}`;
		const apiFetchUrl = `${this.apiProxyUrl}${encodeURIComponent(
			webmentionsFetchUrl
		)}&time=${Date.now()}`;

		return fetch(apiFetchUrl)
			.then((response) => response.json())
			.then((data) => {
				Array.from(data.children).forEach((reply) =>
					this.addWebmentionReply(reply)
				);
				this.wmCommentCounter++;
			})
			.catch(() => {
				return;
			});
	}

	addDevReply(replyData) {
		if (!replyData.user || !replyData.user.name || !replyData.body_html) {
			return;
		}

		let reply = this.cloneReplyElement();

		reply.name.innerHTML = replyData.user.name;
		reply.via.innerHTML = "via DEV";
		reply.via.href = `https://dev.to/${replyData.user.username}/comment/${replyData.id_code}`;

		reply.link.href = `https://dev.to/${replyData.user.username}`;
		reply.avatar.src = replyData.user.profile_image_90 || "";

		// dev api beta doesn't send publish dates for comments
		const publishDate = replyData.published || -1;
		reply.date.remove();

		reply.content.innerHTML = replyData.body_html;

		(<HTMLElement>reply.el.content.firstChild).removeAttribute("hidden");

		const timestamp =
			new Date(publishDate).getTime() + this.devCommentCounter;
		this.replies.push([
			timestamp,
			(<HTMLElement>reply.el.content.firstChild).outerHTML,
		]);
	}

	addWebmentionReply(replyData) {
		if (!replyData.author || !replyData.author.name) {
			return;
		}

		if (!!replyData && replyData["like-of"] === this.targetUrl) {
			this.likes += 1;
			return;
		}

		if (!replyData.content || !replyData.content.html) {
			return;
		}

		let reply = this.cloneReplyElement();

		reply.name.innerHTML = replyData.author.name;
		const source =
			new URL(replyData["url"]).host === "twitter.com"
				? "twitter"
				: new URL(replyData["wm-source"]).host;
		reply.via.innerHTML = `via ${source}`;
		reply.via.href = replyData["wm-source"];

		reply.link.href = replyData.author.url || replyData["wm-source"];
		reply.avatar.src = replyData.author.photo || "";

		const publishDate = replyData.published || replyData["wm-received"];
		reply.date.innerHTML = publishDate
			? new Date(publishDate)
					.toISOString()
					.slice(0, 10)
					.split("-")
					.reverse()
					.join(".")
			: "some time";

		reply.content.innerHTML = replyData.content.html;

		(<HTMLElement>reply.el.content.firstChild).removeAttribute("hidden");

		let timestamp = publishDate ? new Date(publishDate).getTime() : 0;
		timestamp = timestamp + this.wmCommentCounter;
		this.replies.push([
			timestamp,
			(<HTMLElement>reply.el.content.firstChild).outerHTML,
		]);
	}

	cloneReplyElement() {
		let el = document.createElement("template");
		el.innerHTML = this.prototype.outerHTML;
		let link = <HTMLAnchorElement>(
			(<HTMLElement>el.content.firstChild).querySelector(
				'[data-reactions-el="link"]'
			)
		);
		let avatar = <HTMLImageElement>(
			(<HTMLElement>el.content.firstChild).querySelector(
				'[data-reactions-el="avatar"]'
			)
		);
		let name = (<HTMLElement>el.content.firstChild).querySelector(
			'[data-reactions-el="name"]'
		);
		let via = <HTMLAnchorElement>(
			(<HTMLElement>el.content.firstChild).querySelector(
				'[data-reactions-el="via"]'
			)
		);
		let date = (<HTMLElement>el.content.firstChild).querySelector(
			'[data-reactions-el="date"]'
		);
		let content = (<HTMLElement>el.content.firstChild).querySelector(
			'[data-reactions-el="content"]'
		);

		return {
			el: el,
			link: link,
			avatar: avatar,
			name: name,
			via: via,
			date: date,
			content: content,
		};
	}

	showReplies() {
		this.loader.classList.add("is--hidden");
		if (this.replies.length < 1) {
			return;
		}

		this.replies.sort(function (a, b) {
			return a[0] - b[0];
		});

		let replyListHTML = "";
		this.replies.forEach((reply) => {
			replyListHTML += reply[1];
		});

		this.replyList.insertAdjacentHTML("beforeend", replyListHTML);
		this.repliesTitle.removeAttribute("hidden");
	}

	showLikes() {
		this.loader.classList.add("is--hidden");
		if (this.likes < 1) {
			return;
		}
		this.likesCounter.innerHTML = String(this.likes);
		this.likesTitle.removeAttribute("hidden");
	}
}
