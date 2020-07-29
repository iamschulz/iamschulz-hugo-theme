/*
To do: 
- add content
- do something with wine cellar
- write help methods
- add read method for content
*/

import Component from '../../../helpers/component';
import * as ROOMS from './rooms.json';
import * as ITEMS from './items.json';
import * as DIRECTIONS from './directions.json';

class Room {
    constructor(config) {
        this.name = config.name || "";
        this.description = config.description || "";
        this.url = config.url || "";
        this.directions = config.directions || {};
        this.objects = config.objects || {};
    }
}

class Item {
    constructor(config) {
        this.name = config.name || "";
        this.description = config.description || "";
        this.interaction = config.interaction || "";
        this.method = config.method || "";
    }
}

class Direction {
    constructor(config) {
        this.name = config.name || "";
    }
}

export default class TextAdventure extends Component {
    init() {
        this.setupGlobals();
        this.setupDirections();
        this.setupRooms();
        this.setupItems();
        window.setTimeout(() => {
            this.startGame();
        }, 0);
    }

    /* SETUP GAME */
    setupGlobals() {
        this.formats = {
            default: "color: unset; font-weight: normal;",
            directions: "color: salmon; font-weight: 900;",
            items: "color: teal; font-weight: 900;",
            rooms: "color: cornflowerblue; font-weight: 900;",
            error: "color: red; font-weight: 900;"
        };

        window.ta = {
            help: this.help.bind(this),
            go: this.movePC.bind(this),
            inspect: this.inspect.bind(this),
            use: this.use.bind(this),
            reset: this.resetGame.bind(this)
        };
    }

    setupDirections() {
        this.directions = {};
        Object.keys(DIRECTIONS.default).forEach(direction => {
            this.directions[direction] = new Direction(DIRECTIONS.default[direction]);
        });
    }

    setupRooms() {
        const startingRoom = sessionStorage.ta ? JSON.parse(sessionStorage.ta).rooms : 'Lobby';
        const roomsStateConfig = {
            room: {
                value: startingRoom
            }
        }

        this.rooms = {};
        Object.keys(ROOMS.default).forEach(room => {
            const roomConfig = ROOMS.default[room];
            roomConfig.name = room;
            this.rooms[room] = new Room(roomConfig);

            roomsStateConfig.room[room] = {
                event: `taEnter${room[0].toUpperCase() + room.substring(1)}`,
                on: 'onEnterRoom'
            }
        });
        
        this.roomsState = new StateMachine(this, roomsStateConfig);
    }

    setupItems() {
        this.items = {};
        Object.keys(ITEMS.default).forEach(item => {
            this.items[item] = new Item(ITEMS.default[item]);
        });
    }

    /* ACTIONS */
    help() {
        console.warn('help is not implemented yet');
    }

    movePC(inputDirection) {
        const room = this.getCurrentRoom();
        const direction = Object.keys(this.directions).filter(
            direction => direction.toLowerCase() === inputDirection.toLowerCase()
        )[0];

        if (!direction) {
            this.log(`You may only go ${Object.keys(this.directions).join(', ')}.`);
            return;
        }

        if (Object.keys(room.directions).indexOf(direction) < 0) {
            this.log(`You can't go ${direction} from here.`);
            return;
        }

        const newRoom = room.directions[direction].destination;
        this.lastTransition = room.directions[direction].transition;
        
        this.log(
            room.directions[direction].transition,
            this.rooms[newRoom].description
        );

        EventBus.publish(`taEnter${newRoom[0].toUpperCase() + newRoom.substring(1)}`, this.el);
        this.persistState();
        this.loadRoomUrl();
    }

    inspect(thing) {
        if (!thing) {
            this.log(`You take a look around the ${this.getCurrentRoom().name}.`);
            this.inspect(this.getCurrentRoom().name);
            return;
        }

        const room = Object.keys(this.rooms).filter(room => room.toLowerCase() === thing.toLowerCase())[0];
        const item = Object.keys(this.items).filter(item => item.toLowerCase() === thing.toLowerCase())[0];

        if (room && room === this.getCurrentRoom().name) {
            this.log(this.rooms[room].description);
        } else if (room && room !== this.getCurrentRoom().name) {
            this.log(`You need to go into the ${room} before inspecting it.`)
        } else if (item && this.isItemInRoom(item)) {
            this.log(this.items[item].description);
            
        } else {
            console.log(`There is no %c${thing}%c.`, this.formats.items, this.formats.default);
        }
    }

    use(thing) {
        if (!thing) {
            console.log('What do you want to use? Try `ta.use("%cThing%c")`!', this.formats.items, this.formats.default);
            return;
        }

        const item = this.items[
            Object.keys(this.items).filter(item => item.toLowerCase() === thing.toLowerCase())[0]
        ];

        if (!item || !this.isItemInRoom(thing)) {
            console.log(`There is no %c${thing}%c.`, this.formats.items, this.formats.default);
            return;
        }

        if (item.interaction || (item.method && this[item.method])) {
            item.interaction && this.log(item.interaction);
            item.method && this[item.method] && this[item.method]();
        } else {
            console.log(`You can't use %c${item.name}%c like that.`, this.formats.items, this.formats.default);
        }
    }

    /* GAME LOGIC */
    log(words) {
        let parsed = words;
        let styles = [];
        let triggers = [];

        Object.keys(this.formats).forEach(format => {
            if (!this[format]) return;

            Object.keys(this[format]).forEach(trigger => {
                triggers.push({
                    word: trigger,
                    style: this.formats[format]
                });
            });
        });

        parsed = parsed.replace(
            new RegExp(
                triggers.map(trigger => `(${trigger.word})`).join("|"), "gi"
            ), match => {
                let format = triggers.filter(trigger => { 
                    return trigger.word.toLowerCase() === match.toLowerCase() 
                })[0].style;
                styles.push(format);
                styles.push(this.formats.default);
                return `%c${match}%c`;
            }
        );

        console.log(parsed, ...styles);
    }

    startGame() {
        if (!sessionStorage.ta) {
            this.log(`You find yourself in a mansions ${this.getCurrentRoom().name}`);
        } else {
            this.log(
                JSON.parse(sessionStorage.ta).lastTransition
                    ? JSON.parse(sessionStorage.ta).lastTransition 
                    : `You find yourself in the mansions ${this.getCurrentRoom().name}`
            );
        }
        ta.inspect(this.getCurrentRoom().name);
    }

    persistState() {
        sessionStorage.ta = JSON.stringify({
            rooms: this.getCurrentRoom().name,
            lastTransition: this.lastTransition ? this.lastTransition : ""
        });

    }

    getCurrentRoom() {
        return this.rooms[this.roomsState.states.room.currentState];
    }

    isItemInRoom(item) {
        return Object.keys(this.getCurrentRoom().objects)
            .filter(itemName => itemName.toLowerCase() === item.toLowerCase())
            .length > 0;
    }

    loadRoomUrl() {
        if (window.location.pathname === this.getCurrentRoom().url) {
            return;
        }
        window.location = this.getCurrentRoom().url;
    }

    onEnterRoom() {
    }

    /**
     * Gets called from the bookshelf, art catalogue, etc.
     * Lists all blog articles and provides links
     */
    listArticles() {
        const articles = document.querySelectorAll('.article-card__title > a');
        Object.keys(articles).forEach(i => console.log(articles[i].text, " - ", articles[i].href));
    }

    resetGame() {
        this.destroy();
        console.clear();
        this.init();
        window.setTimeout(() => {
            this.persistState();
        }, 0);
    }

    /* EXIT GAME */
    destroy() {
        delete window.ta;
        delete sessionStorage.ta;
    }
}