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

class AdventureCore {
    constructor() {
        this.rooms = {};
        Object.keys(ROOMS.default).forEach(room => {
            this.rooms[room] = new Room(ROOMS.default[room]);
        });
        console.log(this.rooms);
    }
}

export default class TextAdventure extends Component {
    init() {
        new AdventureCore();
    }
}