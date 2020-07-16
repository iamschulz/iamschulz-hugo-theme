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
        this.name = config.name || "";
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

        const item = this.items[
            Object.keys(this.items).filter(item => item.toLowerCase() === thing.toLowerCase())[0]
        ];
        const thingInRoom = Object.keys(this.rooms[this.roomsState.states.room.currentState].objects)
            .filter(item => item.toLowerCase() === thing.toLowerCase())
            .length > 0;

        if (!item || !thingInRoom) {
            console.log(`There is no ${thing}.`);
            return;
        }

        if (item.method && this[item.method]) {
            this[item.method]();
        } else if (item.interaction) {
            console.log(item.interaction);
        } else {
            console.log(`You can't use ${item.name} like that.`);
        }

        EventBus.publish(`taUse${item.name[0].toUpperCase() + item.name.substring(1)}`, this.el);
    }

    /* GAME LOGIC */
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