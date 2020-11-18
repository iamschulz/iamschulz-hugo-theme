import "./carousel.scss";
import Component from "../../../helpers/component";
import SwipeDetection from "../../../helpers/swipeDetection";

//todo: interface swipe events from swipe detection

export default class Carousel extends Component {
	grid: HTMLElement;
	items: Array<HTMLElement>;
	currentPosition: number;
	boundaryItems: Array<number>;

	init() {
		this.items = Array.from(this.grid.children).map(
			(element) => element as HTMLElement
		);
		this.currentPosition = 0; // px
		this.boundaryItems = [];

		new SwipeDetection(this.el).init();

		this.el.setAttribute("data-slider-ready", "true");
		Object.keys(this.items).forEach((index) => {
			this.items[index].setAttribute("data-carousel-index", index);
		});

		this.boundOnSwipe = (event) => {
			this.onSwipe(event);
		};
		this.el.addEventListener("swipe", this.boundOnSwipe);

		this.boundOnSwipeStop = (event) => {
			this.onSwipeStop(event);
		};
		this.el.addEventListener("swipestop", this.boundOnSwipeStop);

		this.boundHandleKeys = (event) => {
			this.handleKeys(event);
		};
		this.el.addEventListener("keyup", this.boundHandleKeys);

		this.observeItems();
	}

	boundOnSwipe(event) {}
	boundOnSwipeStop(event) {}
	boundHandleKeys(event) {}

	observeItems() {
		const callback = (entries) => {
			Object.keys(entries).forEach((index) => {
				entries[index].target.setAttribute(
					"data-carousel-visible",
					entries[index].isIntersecting
				);
				this.calculateBoundaries();
			});
		};

		const observer = new IntersectionObserver(callback, {
			root: this.el,
			threshold: 0.1,
		});

		Object.keys(this.items).forEach((index) => {
			observer.observe(this.items[index]);
		});
	}

	onSwipe(swipeEvent) {
		this.grid.setAttribute("data-autoplay", "false");
		const xDistance = swipeEvent.detail.end.x - swipeEvent.detail.start.x;
		this.moveGridBy(xDistance);
	}

	onSwipeStop(swipeStopEvent) {
		const xDistance =
			swipeStopEvent.detail.end.x - swipeStopEvent.detail.start.x;

		this.moveGridBy(0);

		const endPosition: number = Number(
			window
				.getComputedStyle(this.grid)
				.getPropertyValue("transform")
				.split(",")[4]
		);

		this.currentPosition = endPosition * -1;

		this.calculateBoundaries();
		const reverse = xDistance > 0;
		const target = reverse ? this.boundaryItems[0] : this.boundaryItems[1];
		this.moveGridToIndex(target, reverse);
	}

	handleKeys(event) {
		switch (event.keyCode) {
			case 37: // arrow left
				this.moveGridToIndex(
					Math.max(this.boundaryItems[0], 1) - 1,
					true
				);
				break;
			case 39: // arrow right
				this.moveGridToIndex(
					Math.min(this.boundaryItems[1], this.items.length - 2) + 1,
					false
				);
				break;
			default:
		}
	}

	moveGridBy(distance) {
		window.requestAnimationFrame(() => {
			this.grid.style.transform = `translateX(${
				distance - this.currentPosition
			}px)`;
		});
	}

	moveGridToIndex(index = 0, reverse = true) {
		const position = reverse
			? this.items[index].offsetLeft
			: this.items[index].offsetLeft +
			  this.items[index].clientWidth -
			  this.grid.clientWidth;

		// prime transition
		this.grid.setAttribute("data-autoplay", "true");

		// execute transition
		window.setTimeout(() => {
			this.moveGridBy(this.currentPosition - position);
		}, 0);

		// reset transition
		this.grid.addEventListener("transitionend", () => {
			window.requestAnimationFrame(() => {
				this.currentPosition = position;
			});
			this.grid.setAttribute("data-autoplay", "false");
		});
	}

	calculateBoundaries() {
		// if no items are visible
		const firstItem = this.currentPosition <= 0 ? 0 : this.items.length - 1;
		const lastItem =
			this.currentPosition > this.grid.clientWidth
				? this.items.length - 1
				: 0;

		const visibleItems = Array.from(this.items).filter(
			(item) => item.dataset.carouselVisible === "true"
		);

		// first and last currently visible items
		this.boundaryItems = [
			visibleItems.length > 0
				? Number(visibleItems[0].dataset.carouselIndex)
				: firstItem,
			visibleItems.length > 0
				? Number(
						visibleItems[visibleItems.length - 1].dataset
							.carouselIndex
				  )
				: lastItem,
		];
	}

	destroy() {
		this.el.removeEventListener("swipe", this.boundOnSwipe);
		this.el.removeEventListener("swipestop", this.boundOnSwipeStop);
		this.el.removeEventListener("keyup", this.boundHandleKeys);
	}
}
