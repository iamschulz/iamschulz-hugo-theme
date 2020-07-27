export default class TextAdventureLoader {
    constructor() {
        if (sessionStorage.ta) {
            this.init();
        } else {
            window.ta = {
                start: this.init
            }
            
            console.log(
                "Guess what:You can play this website as a text adventure!\nType '%cta.start()%c' to play.",
                "color: lime;",
                "color: unset;"
            );
        }
    }

    init() {
        const taNode = document.createElement('div');
        taNode.setAttribute('data-component', 'textAdventure');
        document.body.appendChild(taNode);
        delete window.ta;
        window.ComponentLoader.registerComponent(taNode);
    }
}