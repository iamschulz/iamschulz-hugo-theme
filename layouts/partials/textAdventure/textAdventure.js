import Component from '../../../helpers/component';
import * as ROOMS from './rooms.json';
import * as ITEMS from './items.json';

class Room {
    constructor(config) {
        this.name = config.name || "Unnamed room";
        this.intro = config.intro || "";
        this.directions = config.directions || {};
        this.objects = config.objects || {};
    }
}

class Item {
    constructor(config) {
        this.name = config.name || "Unnamed item";
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
    }

    /* SETUP GAME */
    setupGlobals() {
        window.ta = {
            help: this.help.bind(this),
            go: this.movePC.bind(this),
            inspect: this.inspect.bind(this)
        }
    }

    setupRooms() {
        const roomsStateConfig = {
            room: {
                value: 'lobby' // starting room
            }
        }

        this.rooms = {};
        Object.keys(ROOMS.default).forEach(room => {
            this.rooms[room] = new Room(ROOMS.default[room]);

            roomsStateConfig.room[room] = {
                event: `change${room[0].toUpperCase() + room.substring(1)}`,
                on: 'onChangeRoom'
            }
        });
        
        this.roomsState = new StateMachine(this, roomsStateConfig);
    }

    setupItems() {
        this.items = {};
        Object.keys(ITEMS.default).forEach(item => {
            this.items[item] = new Item(ITEMS.default[item]);
            
            // register interaction method here
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
            this.rooms[newRoom].intro
        );
        EventBus.publish(`change${newRoom[0].toUpperCase() + newRoom.substring(1)}`, this.el);
    }

    inspect(thing) {
        console.warn('inspect is not implemented yet');
    }

    /* GAME LOGIC */
    onChangeRoom() {
        // perpetuate state here
    }

    /* EXIT GAME */
    destroy() {
        window.ta = undefined;
    }
}