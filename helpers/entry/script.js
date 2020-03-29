import './style.scss';

import ComponentLoader from '../componentLoader';
// eslint-disable-next-line no-unused-vars
import Component from '../component';
import StateMachine from '../stateMachine';
import EventBus from '../eventBus';
import FocusTrap from '../focusTrap';

// register components here
window.Modules = {
    /**
     * add skeleton functionality:
     * these imports are deferred and bundled into the main chunk
     * code that's supposed to run on every page load goes here
     */
    index: () => import(/* webpackMode: 'eager' */ '../index'),
    colorSchemeToggle: () => import(/* webpackMode: 'eager' */ '../../layouts/partials/colorSchemeToggle/colorSchemeToggle'),
    header: () => import(/* webpackMode: 'eager' */ '../../layouts/partials/header/header'),
    mainMenu: () => import(/* webpackMode: 'eager' */ '../../layouts/partials/mainMenu/mainMenu'),
    overlay: () => import(/* webpackMode: 'eager' */ '../../layouts/partials/overlay/overlay'),
    viewportManager: () => import(/* webpackMode: 'eager' */ '../../layouts/partials/viewportManager/viewportManager'),

    /**
     * add module functionality:
     * these imports are lazy loaded and bundled into separate chunks
     * code that's supposed to run only when it's needed goes here
     */
    // devPostTeaser: () => import(/* webpackChunkName: 'devPostTeaser' */ '../../layouts/partials/devPostTeaser/devPostTeaser'),
    // carousel: () => import(/* webpackChunkName: 'carousel' */ '../../layouts/partials/carousel/carousel'),
    // modal: () => import(/* webpackChunkName: 'modal' */ '../../layouts/partials/modal/modal'),
    // modalTrigger: () => import(/* webpackChunkName: 'modal' */ '../../layouts/partials/modalTrigger/modalTrigger'),
};

window.EventBus = new EventBus();
window.StateMachine = StateMachine;
window.FocusTrap = new FocusTrap();
window.ComponentLoader = new ComponentLoader();
window.ComponentLoader.updateDom();