/*
To do: 
- add content
- do something with wine cellar
- write help methods
- add read method for content
*/

import Component from '../../../helpers/component';
import './textAdventure.scss';
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
            !sessionStorage.ta ? this.startGame() : this.resumeGame();
        }, 0);
    }

    /* -------------------------------- SETUP GAME -------------------------------- */

    /**
     * sets up global functions and log formats
     */
    setupGlobals() {
        this.formats = {
            default: "color: unset; font-weight: normal;",
            directions: "color: salmon; font-weight: 900;",
            items: "color: teal; font-weight: 900;",
            rooms: "color: cornflowerblue; font-weight: 900;",
            help: "color: gold; font-weoght: 900;",
            error: "color: red; font-weight: 900;"
        };

        window.ta = {
            help: this.help.bind(this),
            go: this.movePC.bind(this),
            inspect: this.inspect.bind(this),
            use: this.use.bind(this),
            finish: this.loadRoomUrl.bind(this),
            reset: this.resetGame.bind(this)
        };
    }

    /**
     * sets up directions for the PC to go. For now that's supposed to be north, south, east and west
     */
    setupDirections() {
        this.directions = {};
        Object.keys(DIRECTIONS.default).forEach(direction => {
            this.directions[direction] = new Direction(DIRECTIONS.default[direction]);
        });
    }

    /**
     * sets up all the rooms the PC can visit. Registers a gloabal state for rooms
     */
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

    /**
     * sets up all the items the PC can use
     */
    setupItems() {
        this.items = {};
        Object.keys(ITEMS.default).forEach(item => {
            this.items[item] = new Item(ITEMS.default[item]);
        });
    }

    /* -------------------------------- ACTIONS -------------------------------- */

    /**
     * displays a help text explaining how to play
     */
    help() {
        console.log('💡 %cHey! Listen!', this.formats.help);
        console.log('You are in Text Adventure mode. That means you can navigate this site as if it were an early computer game.');
        console.log('It\'s written in javascript, so every command is a js command. Here is what you can do:');
        console.log('Move around the game world by using %cta.go("%cDirection%c")%c. You can go to all four cardinal directions. Directions are marked in %csalmon%c.', this.formats.help, this.formats.directions, this.formats.help, this.formats.default, this.formats.directions, this.formats.default);
        console.log('Inspect an item or room by using %cta.inspect("%cItem%c")%c to get more information on it. Items are marked in %cgreen%c and rooms are %cblue%c.', this.formats.help, this.formats.items, this.formats.help, this.formats.default, this.formats.items, this.formats.default, this.formats.rooms, this.formats.default);
        console.log('Use an item by using %cta.use("%cItem%c")%c. Note that not all items are usable.', this.formats.help, this.formats.items, this.formats.help, this.formats.default);
        console.log('Finish using an item by calling %cta.finish()%c. You don\'t need to do that for all items, though.', this.formats.help, this.formats.default);
        console.log('%cta.reset()%c resets the game to the start. In case you\'re lost or just want to go back.', this.formats.help, this.formats.default);
        console.log('%cta.help()%c displays this message.', this.formats.help, this.formats.default);
    }

    /**
     * Moves the PC to another room (if possible) and logs it. Triggers the State Machine callback.
     * 
     * @param {string} inputDirection - one of the directions set up before
     */
    movePC(inputDirection) {
        const room = this.getCurrentRoom();
        const direction = Object.keys(this.directions).filter(
            direction => direction.toLowerCase() === inputDirection.toLowerCase()
        )[0];

        if (!direction) {
            this.log(`❌ You may only go ${Object.keys(this.directions).join(', ')}.`);
            return;
        }

        if (Object.keys(room.directions).indexOf(direction) < 0) {
            this.log(`❌ You can't go ${direction} from here.`);
            return;
        }

        const newRoom = room.directions[direction].destination;
        this.lastTransition = room.directions[direction].transition;
        
        this.log(`💨 ${room.directions[direction].transition} ${this.rooms[newRoom].description}`);

        EventBus.publish(`taEnter${newRoom[0].toUpperCase() + newRoom.substring(1)}`, this.el);
        this.persistState();
        this.loadRoomUrl();
    }

    /**
     * lets the PC inspect the current room (without param) or an item, if available in the current room.
     * 
     * @param {string} thing - one of the registered items or rooms (optional)
     */
    inspect(thing) {
        if (!thing) {
            this.log(`👁️ You take a look around the ${this.getCurrentRoom().name}.`);
            this.inspect(this.getCurrentRoom().name);
            return;
        }

        const room = Object.keys(this.rooms).filter(room => room.toLowerCase() === thing.toLowerCase())[0];
        const item = Object.keys(this.items).filter(item => item.toLowerCase() === thing.toLowerCase())[0];

        if (room && room === this.getCurrentRoom().name) {
            this.log(`👁️ ${this.rooms[room].description}`);
        } else if (room && room !== this.getCurrentRoom().name) {
            this.log(`❌ You need to go into the ${room} before inspecting it.`)
        } else if (item && this.isItemInRoom(item)) {
            this.log(`👁️ ${this.items[item].description}`);
            
        } else {
            console.log(`❌ There is no %c${thing}%c.`, this.formats.items, this.formats.default);
        }
    }

    /**
     * lets the PC use an Item. Logs out the assigned interaction string, triggers the assigned method.
     * 
     * @param {string} thing - one of the registered items
     */
    use(thing) {
        if (!thing) {
            console.log('💡 What do you want to use? Try `ta.use("%cThing%c")`!', this.formats.items, this.formats.default);
            return;
        }

        const item = this.items[
            Object.keys(this.items).filter(item => item.toLowerCase() === thing.toLowerCase())[0]
        ];

        if (!item || !this.isItemInRoom(thing)) {
            console.log(`❌ There is no %c${thing}%c.`, this.formats.items, this.formats.default);
            return;
        }

        if (item.interaction || (item.method && this[item.method])) {
            this.currentItem = item;
            item.interaction && this.log(`⚡ ${item.interaction}`);
            item.method && this[item.method] && this[item.method]();
            this.currentItem = null;
        } else {
            console.log(`❌ You can't use %c${item.name}%c like that.`, this.formats.items, this.formats.default);
        }
    }

    /* -------------------------------- GAME LOGIC -------------------------------- */

    /**
     * logs out a string. Items, Rooms, Directions get highlighted in their respective format.
     * 
     * @param {string} words - the output value
     */
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

    /**
     * gets called when opening the document when no session data is available
     */
    startGame() {
        this.help();
        console.log('Now go and %cexplore this website%c!', this.formats.help, this.formats.default);
        console.log(' ');
        this.log(`✨ You find yourself in a mansions ${this.getCurrentRoom().name}`);
        ta.inspect(this.getCurrentRoom().name);
    }

    /**
     * gets called when opening the document when session data is available
     */
    resumeGame() {
        if (!sessionStorage.ta) return;

        const store = JSON.parse(sessionStorage.ta)
        this.log(
            store.lastTransition
                ? `💨 ${store.lastTransition}`
                : `💨 You find yourself in the mansions ${this.getCurrentRoom().name}`
        );

        if (
            store.currentItem
            && store.currentItem.url
            && store.currentItem.url === window.location.href
        ) {
            this.log(`⚡ ${store.currentItem.interaction}`);
            console.log('💡 Use %cta.finish()%c to go back.', this.formats.help, this.formats.default);
        } else {
            ta.inspect(this.getCurrentRoom().name);
        }
    }

    /**
     * writes current state to session storage. useful for navigating to another document.
     */
    persistState() {
        sessionStorage.ta = JSON.stringify({
            rooms: this.getCurrentRoom().name,
            currentItem: this.currentItem ? this.currentItem : "",
            lastTransition: this.lastTransition ? this.lastTransition : "",
        });

    }

    /**
     * returns the current room as a string.
     */
    getCurrentRoom() {
        return this.rooms[this.roomsState.states.room.currentState];
    }

    /**
     * returns a bool whether an item is in the current room
     * 
     * @param {string} item 
     */
    isItemInRoom(item) {
        return Object.keys(this.getCurrentRoom().objects)
            .filter(itemName => itemName.toLowerCase() === item.toLowerCase())
            .length > 0;
    }

    /**
     * navigates to the document assigned to the current room
     */
    loadRoomUrl() {
        if (window.location.pathname === this.getCurrentRoom().url) {
            return;
        }
        window.location = this.getCurrentRoom().url;
    }

    /**
     * gets called upon entering a room
     */
    onEnterRoom() {
    }

    /**
     * lists all books (for /tech)
     */
    listBooks() {
        this.registerArticleItems('Book', 'You delve into');
        console.log('💡 Use `ta.use("%cBook X%c")` to read!', this.formats.items, this.formats.default)
    }

    /**
     * lists all artworks (for /art)
     */
    listArt() {
        this.registerArticleItems('Artwork', 'You take a very close look at');
        console.log('💡 Use `ta.use("%cArtwork X%c")` to inspire yourself!', this.formats.items, this.formats.default)
    }

    /**
     * lists all videos (for /video)
     */
    listVideo() {
        this.registerArticleItems('Video', 'You start watching');
        console.log('💡 Use `ta.use("%cVideo X%c")` to watch!', this.formats.items, this.formats.default)
    }

    /**
     * Gets called from the bookshelf, art catalogue, etc.
     * Lists all blog articles for a category and provides links.
     * blog articles will become items in the current room.
     */
    registerArticleItems(name, transition) {
        const articles = document.querySelectorAll('.article-card__title > a');
        Object.keys(articles).forEach(i => {
            const item = new Item({
                "name": `${name} ${i}`,
                "description": articles[i].text,
                "interaction": `${transition} ${name} ${i}.`,
                "method": "loadItemUrl",
            });
            item.url = articles[i].href;
            this.getCurrentRoom().objects[`${name} ${i}`] = item;
            this.items[`${name} ${i}`] = item;
            this.log(`${name} ${i}: ${articles[i].text}`);
        });
    }

    /**
     * navigates to the document assigned to the article item
     */
    loadItemUrl() {
        if (!(this.currentItem && this.currentItem.url)) return;

        this.persistState();
        window.location = this.currentItem.url;
    }

    /**
     * It is what it is.
     */
    drinkWine() {
        document.body.classList.add('is--drunk');
        this.log('👁️ Well... maaaaybe too large. You feel a bit dizzy.')
    }

    /**
     * resets the game to the start state
     */
    resetGame() {
        this.destroy();
        console.clear();
        this.init();
        window.setTimeout(() => {
            this.persistState();
        }, 0);
    }

    /* -------------------------------- EXIT GAME -------------------------------- */
    destroy() {
        delete window.ta;
        delete sessionStorage.ta;
    }
}