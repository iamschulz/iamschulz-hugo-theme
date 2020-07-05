import Component from '../../../helpers/component';
import * as ROOMS from './rooms.json';

class Room {
    constructor(config) {
        this.name = config.name || "Unnamed room";
        this.intro = config.intro || "";
        this.directions = config.directions || {};
        this.objects = config.objects || {};
    }
}

export default class TextAdventure extends Component {
    init() {
        this.setupRooms();
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

    /* ACTIONS */
    help() {
        console.warn('help is not implemented yet');
    }

    movePC(direction) {
        const validDirections = ['north', 'east', 'south', 'west'];
        const room = this.rooms[this.roomsState.states.room.currentState];

        if (validDirections.indexOf(direction) < 0) {
            console.log("you may only go", validDirections);
            return;
        }

        if (Object.keys(room.directions).indexOf(direction) < 0) {
            console.log(`you can't go ${direction} from here.`);
            return;
        }

        const newRoom = room.directions[direction];
        EventBus.publish(`change${newRoom[0].toUpperCase() + newRoom.substring(1)}`, this.el);
    }

    inspect(thing) {
        console.warn('inspect is not implemented yet');
    }

    /* GAME LOGIC */
    onChangeRoom() {
        const room = this.roomsState.states.room.currentState;
        console.log(this.rooms[room].intro);
    }

    /* EXIT GAME */
    destroy() {
        window.ta = undefined;
    }
}