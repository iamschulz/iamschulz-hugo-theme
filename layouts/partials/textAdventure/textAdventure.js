import Component from '../../../helpers/component';
import * as ROOMS from './rooms.json';
import * as ITEMS from './items.json';

class Room {
    constructor(config) {
        this.description = config.description || "";
        this.directions = config.directions || {};
        this.objects = config.objects || {};
    }
}

class Item {
    constructor(config) {
        this.description = config.description || "";
        this.interaction = config.interaction || "";
        this.method = config.method || "";
    }
}

export default class TextAdventure extends Component {
    init() {
        this.setupRooms();
        this.setupItems();
        this.setupGlobals();
        this.startGame();
    }

    /* SETUP GAME */
    setupGlobals() {
        window.t = this.parse.bind(this);
        window.ta = {
            help: this.help.bind(this),
            go: this.movePC.bind(this),
            inspect: this.inspect.bind(this),
            use: this.use.bind(this)
        }
    }

    setupRooms() {
        const roomsStateConfig = {
            room: {
                value: 'Lobby' // starting room
            }
        }

        this.rooms = {};
        Object.keys(ROOMS.default).forEach(room => {
            this.rooms[room] = new Room(ROOMS.default[room]);

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

    movePC(direction) {
        const validDirections = ['north', 'east', 'south', 'west'];
        const room = this.rooms[this.roomsState.states.room.currentState];

        if (validDirections.indexOf(direction) < 0) {
            console.log("You may only go", validDirections);
            return;
        }

        if (Object.keys(room.directions).indexOf(direction) < 0) {
            console.log(`You can't go ${direction} from here.`);
            return;
        }

        const newRoom = room.directions[direction].destination;
        console.log(
            room.directions[direction].transition,
            this.rooms[newRoom].description
        );
        EventBus.publish(`taEnter${newRoom[0].toUpperCase() + newRoom.substring(1)}`, this.el);
    }

    inspect(thing) {
        if (!thing) {
            console.log(`You take a look around the ${this.roomsState.states.room.currentState}.`);
            this.inspect(this.roomsState.states.room.currentState);
            return;
        }
        if (this.rooms[thing]) {
            console.log(this.rooms[thing].description);
        } else if (this.items[thing]) {
            console.log(this.items[thing].description);
        } else {
            console.log(`There is no ${thing}.`);
        }
    }

    use(thing) {
        if (!thing) {
            console.log('What do you want to use? Try `ta.use("Thing")`!')
            return;
        }

        if (!this.items[thing]) {
            console.log(`There is no ${thing}.`);
            return;
        }

        if (this.items[thing].method && this[this.items[thing].method]) {
            this[this.items[thing].method]();
        } else if (this.items[thing].interaction) {
            console.log(this.items[thing].interaction);
        } else {
            console.log(`You can't use ${thing} like that.`);
        }

        EventBus.publish(`taUse${thing[0].toUpperCase() + thing.substring(1)}`, this.el);
    }

    /* GAME LOGIC */
    parse(input) {
        if (input.split(' ').length < 1 || input.split(' ').length > 2) {
            console.warn('Invalid input. Try something like t("go west") or t("use thingamagic"). Type ta for a list of valid commands.');
            return;
        }

        const command = input.split(' ')[0];
        const object = input.split(' ')[1];

        if (!(Object.keys(ta).some((x) => x === command))) {
            console.warn(`I don't know what ${command} means.`)
            return;
        }

        ta[command](object);
    }

    startGame() {
        console.log('You find yourself in a mansion.');
        ta.inspect('Lobby');
    }

    onEnterRoom() {
    }

    /**
     * Gets called from the bookshelf
     * Lists all blog articles and provides links
     */
    listArticles() {
        console.warn('Articles are not yet implemented');
    }

    /* EXIT GAME */
    destroy() {
        window.t = undefined;
        window.ta = undefined;
    }
}