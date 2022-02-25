import Component from "../../../helpers/component";

interface devReply {
	type_of: string;
	id_code: string;
	created_at: string;
	body_html: string;
	user: {
		name: string;
		username: string;
		profile_image_90: string;
	};
	children: Array<any>;
}

interface wmReply {
	author: {
		name: string;
		url?: string;
		photo?: string;
	};
	content?: {
		text: string;
		html: string;
	};
	published: string;
	"like-of": string;
	"repost-of": string;
}

export default class Reactions extends Component {
	apiProxyUrl: string;
	webmentionsUrl: string;
	devId: string;
	targetUrl: string;
	replies: Array<{
		timestamp: number;
		body: string;
	}>;
	fetches: Array<Promise<void>>;
	likes: number;
	devCommentCounter: number;
	wmCommentCounter: number;
	prototype: HTMLElement;
	loader: HTMLElement;
	replyList: HTMLElement;
	repliesTitle: HTMLElement;
	likesCounter: HTMLElement;
	likesTitle: HTMLButtonElement;

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
		this.fetches = [this.getLikes()];

		if (this.devId) {
			this.fetches.push(this.getDevLikes());
		}
		if (this.devId) {
			this.fetches.push(this.getDevComments());
		}
		if (this.webmentionsUrl) {
			this.fetches.push(this.getWebmentions());
		}

		this.initLikeButton();

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

		this.removePrototypes();
	}

	getLikes() {
		const articleUrl = window.location.href.replace(
			window.location.protocol + "//",
			""
		);
		const likeGetUrl = `https://iamschulz.com/like-api/get/${articleUrl}`;
		const apiFetchUrl = `${
			this.apiProxyUrl
		}${likeGetUrl}&time=${Date.now()}`;

		return fetch(apiFetchUrl)
			.then((response) => response.text())
			.then((data) => {
				this.likes += Number(data);
			})
			.catch(() => {
				return;
			});
	}

	getDevComments() {
		this.devCommentCounter = 0;
		const apiFetchUrl = `https://dev.to/api/comments?a_id=${
			this.devId
		}&time=${Date.now()}`;

		return fetch(apiFetchUrl)
			.then((response) => response.json())
			.then((data) => {
				Array.from(data).forEach((reply) =>
					this.addDevReply(<devReply>reply)
				);
				this.devCommentCounter++;
			})
			.catch(() => {
				return;
			});
	}

	getDevLikes() {
		const apiFetchUrl = `https://dev.to/api/articles/${
			this.devId
		}&time=${Date.now()}`;

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
					this.addWebmentionReply(<wmReply>reply)
				);
				this.wmCommentCounter++;
			})
			.catch(() => {
				return;
			});
	}

	addDevReply(devReplyData: devReply) {
		if (
			!devReplyData.user ||
			!devReplyData.user.name ||
			!devReplyData.body_html
		) {
			return;
		}

		let reply = this.cloneReplyElement();

		reply.name.innerHTML = devReplyData.user.name;
		reply.via.innerHTML = "via DEV";
		reply.via.href = `https://dev.to/${devReplyData.user.username}/comment/${devReplyData.id_code}`;

		reply.link.href = `https://dev.to/${devReplyData.user.username}`;
		reply.avatar.dataset["src"] = devReplyData.user.profile_image_90 || "";
		reply.avatar.classList.add("is--lazy");

		const publishDate = devReplyData.created_at || -1;
		reply.date.innerHTML = publishDate
			? new Date(publishDate).toLocaleTimeString([], {
					year: "numeric",
					month: "numeric",
					day: "numeric",
					hour: "2-digit",
					minute: "2-digit",
			  })
			: "some time";

		reply.content.innerHTML = devReplyData.body_html;

		if (devReplyData.children.length > 0) {
			reply.replyBtn.href = `https://dev.to/${devReplyData.user.username}/comment/${devReplyData.id_code}`;
			reply.replyBtn.innerText = `${
				devReplyData.children.length
			} more comment${devReplyData.children.length > 1 ? "s" : ""}`;
			reply.replyBtn.removeAttribute("hidden");
			reply.replyBtn.classList.remove("is--hidden");
		}

		(<HTMLElement>reply.el.content.firstChild).removeAttribute("hidden");

		const timestamp =
			new Date(publishDate).getTime() + this.devCommentCounter;
		this.replies.push({
			timestamp: timestamp,
			body: (<HTMLElement>reply.el.content.firstChild).outerHTML,
		});
	}

	addWebmentionReply(wmReplyData: wmReply) {
		if (!wmReplyData.author || !wmReplyData.author.name) {
			return;
		}

		if (!!wmReplyData && wmReplyData["like-of"] === this.targetUrl) {
			this.likes += 1;
			return;
		}

		if (!wmReplyData.content || !wmReplyData.content.html) {
			return;
		}

		let reply = this.cloneReplyElement();

		reply.name.innerHTML = wmReplyData.author.name;
		const source =
			new URL(wmReplyData["url"]).host === "twitter.com"
				? "twitter"
				: new URL(wmReplyData["wm-source"]).host;
		reply.via.innerHTML = `via ${source}`;
		reply.via.href = wmReplyData["wm-source"];

		reply.link.href = wmReplyData.author.url || wmReplyData["wm-source"];
		reply.avatar.dataset["src"] = wmReplyData.author.photo || "";
		reply.avatar.classList.add("is--lazy");

		const publishDate = wmReplyData.published || wmReplyData["wm-received"];
		reply.date.innerHTML = publishDate
			? new Date(publishDate).toLocaleTimeString([], {
					year: "numeric",
					month: "numeric",
					day: "numeric",
					hour: "2-digit",
					minute: "2-digit",
			  })
			: "some time";

		reply.content.innerHTML = wmReplyData.content.html;

		(<HTMLElement>reply.el.content.firstChild).removeAttribute("hidden");

		let timestamp = publishDate ? new Date(publishDate).getTime() : 0;
		timestamp = timestamp + this.wmCommentCounter;
		this.replies.push({
			timestamp: timestamp,
			body: (<HTMLElement>reply.el.content.firstChild).outerHTML,
		});
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
		let date = (<HTMLTimeElement>el.content.firstChild).querySelector(
			'[data-reactions-el="date"]'
		);
		let content = (<HTMLDivElement>el.content.firstChild).querySelector(
			'[data-reactions-el="content"]'
		);
		let replyBtn = <HTMLAnchorElement>(
			(<HTMLElement>el.content.firstChild).querySelector(
				'[data-reactions-el="reply"]'
			)
		);

		return {
			el,
			link,
			avatar,
			name,
			via,
			date,
			content,
			replyBtn,
		};
	}

	showReplies() {
		this.loader.classList.add("is--hidden");
		if (this.replies.length < 1) {
			return;
		}

		this.replies.sort((a, b) => b.timestamp - a.timestamp);

		let replyListHTML = "";
		this.replies.forEach((reply) => {
			replyListHTML += reply.body;
		});

		this.replyList.insertAdjacentHTML("beforeend", replyListHTML);
		this.repliesTitle.removeAttribute("hidden");
		(window as any).Lazyload.update();
	}

	showLikes() {
		this.loader.classList.add("is--hidden");
		this.likesCounter.innerHTML = String(this.likes);
		this.likesTitle.removeAttribute("hidden");
	}

	initLikeButton() {
		const articleUrl = window.location.href.replace(
			window.location.protocol + "//",
			""
		);
		const storedLikes = JSON.parse(localStorage.getItem("likes")) || {};

		if (storedLikes[articleUrl]) {
			return;
		}

		const likePutUrl = `https://iamschulz.com/like-api/put/${articleUrl}`;
		const apiFetchUrl = `${
			this.apiProxyUrl
		}${likePutUrl}&time=${Date.now()}${Math.floor(Math.random() * 10000)}`;

		this.likesTitle.addEventListener(
			"click",
			() => {
				fetch(apiFetchUrl).then(() => {
					this.likes += 1;
					this.likesCounter.innerHTML = String(this.likes);

					storedLikes[articleUrl] = true;
					localStorage.setItem("likes", JSON.stringify(storedLikes));
					this.likesTitle.setAttribute("aria-disabled", "true");
					this.animateLikeButton();
				});
			},
			{ once: true }
		);

		this.likesTitle.removeAttribute("aria-disabled");
	}

	animateLikeButton() {
		this.likesTitle.classList.add("is--animated");
		window.setTimeout(() => {
			this.likesTitle.classList.remove("is--animated");
		}, 5000);
	}

	removePrototypes() {
		this.prototype.remove();
	}
}
