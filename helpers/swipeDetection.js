/**
 * adds a swipe and a swipestop event to a DOM element
 * events return swipe start and end points, direction and distance
 * triggers on touch and mouse events
 *
 * usage:
 *      new SwipeDetection(el).init();
        el.addEventListener('swipe', (event) => {
            console.log(event.detail);
        });
        el.addEventListener('swipestop', (event) => {
            console.log(event.detail);
        });
 */

export default class SwipeDetection {
    constructor(el) {
        this.el = el;
    }

    init() {
        this.reset();
    }

    reset() {
        this.swipeData = {
            start: {
                x: null,
                y: null,
            },
            end: {
                x: null,
                y: null,
            },
            direction: null,
            distance: null,
        };

        this.removeDragListener();
        this.removeStopListener();

        this.boundStartTrackSwipe = (event) => this.startTrackSwipe(event);
        this.el.addEventListener('mousedown', this.boundStartTrackSwipe, { passive: true });
        this.el.addEventListener('touchstart', this.boundStartTrackSwipe, { passive: true });
    }

    removeStartListener() {
        if (this.boundStartTrackSwipe) {
            this.el.removeEventListener('mousedown', this.boundStartTrackSwipe);
            this.el.removeEventListener('touchstart', this.boundStartTrackSwipe);
        }
        this.boundStopTrackSwipe = null;
    }

    removeDragListener() {
        if (this.boundTrackSwipe) {
            document.body.removeEventListener('mousemove', this.boundTrackSwipe);
            document.body.removeEventListener('touchmove', this.boundTrackSwipe);
        }
        this.boundTrackSwipe = null;
    }

    removeStopListener() {
        if (this.boundStopTrackSwipe) {
            window.removeEventListener('mouseout', this.boundStopTrackSwipe);
            document.body.removeEventListener('mouseup', this.boundStopTrackSwipe);
            this.el.removeEventListener('mouseout', this.boundStopTrackSwipe);
            this.el.removeEventListener('touchend', this.boundStopTrackSwipe);
            this.el.removeEventListener('touchcancel', this.boundStopTrackSwipe);
        }
        this.boundStopTrackSwipe = null;
        this.pointerLocation = null;
    }

    startTrackSwipe(startEvent) {
        this.removeStartListener();

        const pointer = startEvent.type.indexOf('touch') >= 0
            ? startEvent.touches[0]
            : startEvent;

        this.swipeData.start = {
            x: !pointer.clientX ? 0 : pointer.clientX,
            y: !pointer.clientY ? 0 : pointer.clientY,
        };

        this.boundStopTrackSwipe = (event) => this.stopTrackSwipe(event);
        window.addEventListener('mouseout', this.boundStopTrackSwipe, { passive: true });
        document.body.addEventListener('mouseup', this.boundStopTrackSwipe, { passive: true });
        this.el.addEventListener('mouseout', this.boundStopTrackSwipe, { passive: true });
        this.el.addEventListener('touchend', this.boundStopTrackSwipe, { passive: true });
        this.el.addEventListener('touchcancel', this.boundStopTrackSwipe, { passive: true });

        this.boundTrackSwipe = (event) => this.trackSwipe(event);
        document.body.addEventListener('mousemove', this.boundTrackSwipe, { passive: true });
        document.body.addEventListener('touchmove', this.boundTrackSwipe);
    }

    trackSwipe(swipeEvent) {
        const pointer = swipeEvent.type.indexOf('touch') >= 0
            ? swipeEvent.touches[0]
            : swipeEvent;

        this.swipeData.end = {
            x: !pointer.clientX ? 0 : pointer.clientX,
            y: !pointer.clientY ? 0 : pointer.clientY,
        };

        this.swipeData.distance = this.getSwipeDistance();
        this.swipeData.direction = this.getSwipeDirection();

        this.publishEvent();
    }

    stopTrackSwipe(stopEvent) {
        if (
            stopEvent.type !== 'mouseout'
            || (stopEvent.type === 'mouseout' && !document.contains(stopEvent.relatedTarget))
        ) {
            this.removeStopListener();
            this.publishEvent('swipestop');
            this.reset();
        }
    }

    getSwipeDistance() {
        // calculate distance between start and end point
        return Math.sqrt(
            (this.swipeData.start.x - this.swipeData.end.x) ** 2
            + (this.swipeData.start.y - this.swipeData.end.y) ** 2
        );
    }

    getSwipeDirection() {
        let direction = '';
        const distanceX = this.swipeData.start.x - this.swipeData.end.x;
        const distanceY = this.swipeData.start.y - this.swipeData.end.y;

        if (Math.sqrt(distanceX ** 2) > Math.sqrt(distanceY ** 2)) {
            direction = distanceX > 0 ? 'left' : 'right';
        } else {
            direction = distanceY > 0 ? 'up' : 'down';
        }

        return direction;
    }

    publishEvent(eventName = 'swipe') {
        const swipeEvent = new CustomEvent(eventName, {
            bubbles: true,
            detail: this.swipeData,
        });
        if (this.swipeData.distance > 0 && this.swipeData.direction) {
            this.el.dispatchEvent(swipeEvent);
        }
    }
}
