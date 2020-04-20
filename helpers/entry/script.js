import './style.scss';

import ComponentLoader from '../componentLoader';
// eslint-disable-next-line no-unused-vars
import Component from '../component';
import StateMachine from '../stateMachine';
import EventBus from '../eventBus';
import FocusTrap from '../focusTrap';
import LazyLoad from 'vanilla-lazyload';

require("../../assets/svg/public/favicon.svg");
require("../../assets/svg/public/logo.svg");

// register components here
window.Modules = {
    /**
     * add skeleton functionality:
     * these imports are deferred and bundled into the main chunk
     * code that's supposed to run on every page load goes here
     */
    body: () => import(/* webpackMode: 'eager' */ '../../layouts/partials/body/body'),
    article: () => import(/* webpackMode: 'eager' */ '../../layouts/partials/article/article'),
    tableOfContents: () => import(/* webpackMode: 'eager' */ '../../layouts/partials/tableOfContents/tableOfContents'),
    colorSchemeToggle: () => import(/* webpackMode: 'eager' */ '../../layouts/partials/colorSchemeToggle/colorSchemeToggle'),
    search: () => import(/* webpackMode: 'eager' */ '../../layouts/partials/search/search'),

    /**
     * add module functionality:
     * these imports are lazy loaded and bundled into separate chunks
     * code that's supposed to run only when it's needed goes here
     */
    presentation: () => import(/* webpackChunkName: 'presentation' */ '../../layouts/partials/presentation/presentation'),
    carousel: () => import(/* webpackChunkName: 'carousel' */ '../../layouts/partials/carousel/carousel'),
    overlay: () => import(/* webpackChunkName: 'modal' */ '../../layouts/partials/overlay/overlay'),
    modal: () => import(/* webpackChunkName: 'modal' */ '../../layouts/partials/modal/modal'),
    modalTrigger: () => import(/* webpackChunkName: 'modal' */ '../../layouts/partials/modalTrigger/modalTrigger'),
};

window.EventBus = new EventBus();
window.StateMachine = StateMachine;
window.FocusTrap = new FocusTrap();
window.ComponentLoader = new ComponentLoader();
window.ComponentLoader.updateDom();
new LazyLoad({
    elements_selector: ".is--lazy",
    class_loading: ".is--loading",
    class_loaded: ".is--loaded",
    class_error: ".is--error",
    use_native: true,
});
