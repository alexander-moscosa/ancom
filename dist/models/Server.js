"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = __importDefault(require("socket.io"));
const path_1 = __importDefault(require("path"));
const Files_1 = __importDefault(require("../helpers/Files"));
class Server {
    constructor(port) {
        this._app = (0, express_1.default)();
        this._port = port;
        this._server = http_1.default.createServer(this._app);
        this._io = new socket_io_1.default.Server(this._server);
        this._database = path_1.default.resolve(__dirname, '../../database/rooms.json');
    }
    setCors() {
        this._app.use((0, cors_1.default)({
            origin: '*',
            methods: ['GET'],
            credentials: true
        }));
    }
    sockets() {
        return __awaiter(this, void 0, void 0, function* () {
            this._io.on('connection', (socket) => {
                const rooms = Files_1.default.readFile(this._database);
                const roomsObject = JSON.parse(rooms);
                let codeRoom;
                //console.log(`user ${ socket.id } connected`); //? Debug
                socket.on('enter-room', ({ username, code }) => {
                    codeRoom = code;
                    const rooms_existing = [];
                    for (const key of roomsObject.rooms) {
                        if (key.code === code) {
                            rooms_existing.push(true);
                        }
                        else {
                            rooms_existing.push(false);
                        }
                    }
                    const rooms_array_existing = rooms_existing.find(e => e === true);
                    //console.log(rooms); //? Debug
                    if (rooms_array_existing) {
                        for (const key of roomsObject.rooms) {
                            if (key.code === codeRoom) {
                                const index = roomsObject.rooms.indexOf(key);
                                roomsObject.rooms[index].users.push({
                                    username,
                                    id: socket.id
                                });
                                Files_1.default.writeFile(this._database, roomsObject);
                                socket.join(code);
                            }
                        }
                        const room = roomsObject.rooms.find(e => e.code === codeRoom);
                        const user = room.users.find(e => e.id === socket.id);
                        this._io.to(code).emit('online-users', room === null || room === void 0 ? void 0 : room.users);
                        socket.on('disconnect', () => {
                            const roomIndex = roomsObject.rooms.indexOf(room);
                            const userIndex = roomsObject.rooms[roomIndex].users.indexOf(user);
                            roomsObject.rooms[roomIndex].users.splice(userIndex, 1);
                            Files_1.default.writeFile(this._database, roomsObject);
                            this._io.to(code).emit('online-users', room === null || room === void 0 ? void 0 : room.users);
                            if ((room === null || room === void 0 ? void 0 : room.users.length) === 0) {
                                roomsObject.rooms.splice(roomIndex, 1);
                                Files_1.default.writeFile(this._database, roomsObject);
                            }
                            //console.log(`user ${ socket.id } disconnected`); //? Debug
                        });
                    }
                    else {
                        socket.emit('error', 'The room you are searching for, doesn\'t exist.');
                    }
                });
                socket.on('create-room', ({ username, code }) => {
                    const rooms = JSON.parse(Files_1.default.readFile(this._database));
                    const roomExists = rooms.rooms.find(e => e.code === code);
                    if (!roomExists) {
                        rooms.rooms.push({
                            code,
                            users: []
                        });
                        Files_1.default.writeFile(this._database, rooms);
                    }
                });
                socket.on('message', ({ username, message }) => {
                    if (message.trim().length !== 0)
                        this._io.to(codeRoom).emit('new-message', { id: socket.id, username, message });
                });
                socket.on('disconnect', () => {
                    //console.log(`user ${ socket.id } disconnected`); //? Debug
                });
            });
        });
    }
    runServer() {
        // this._app.listen( this._port, () => {
        //     console.log(`\nServer listening on port ${ this._port }`);
        // });
        this._io.listen(Number(this._port));
    }
}
exports.default = Server;
