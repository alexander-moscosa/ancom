import express from 'express';
import cors from 'cors';
import http from 'http';
import socket from 'socket.io';
import path from 'path';

import Files from '../helpers/Files';
import { Room, Rooms, User } from '../interfaces/Rooms';

class Server {

    private _app: express.Application;
    private _port: string;
    private _server: http.Server;
    private _io;
    private _database: string;

    constructor( port: string ){
        this._app = express();
        this._port = port;
        this._server = http.createServer(this._app);
        this._io = new socket.Server(this._server);
        this._database = path.resolve(__dirname, '../../database/rooms.json');
    }

    public setCors(): void {
        this._app.use( cors({
            origin: '*', //! Change
            methods: ['GET'],
            credentials: true
        }));
    }

    public sockets(): void {

        this._io.on('connection', (socket) => {
            
            const rooms = Files.readFile( this._database );
            const roomsObject: Rooms = JSON.parse(rooms);
            
            let codeRoom: string;

            //console.log(`user ${ socket.id } connected`); //? Debug
        
            socket.on('enter-room', ({username, code}) => {

                codeRoom = code;
                const rooms_existing: boolean[] = [];

                for ( const key of roomsObject.rooms ) {
                    if ( key.code === code ) {
                        rooms_existing.push(true);
                    } else {
                        rooms_existing.push(false);
                    }
                }

                const rooms_array_existing = rooms_existing.find(e => e === true);
                //console.log(rooms); //? Debug
                

                if ( rooms_array_existing ) {
                    for ( const key of roomsObject.rooms ) {
                        if ( key.code === codeRoom ) {
                            const index = roomsObject.rooms.indexOf( key );
                            roomsObject.rooms[index].users.push({
                                username,
                                id: socket.id
                            });
                            Files.writeFile( this._database, roomsObject );
                            socket.join(code);
                        }
                    }

                    const room: Room | undefined = roomsObject.rooms.find( e => e.code === codeRoom );
                    const user: User | undefined = room!.users.find( e => e.id === socket.id );

                    this._io.to(code).emit('online-users', room?.users);

                    socket.on('disconnect', () => {

                        const roomIndex: number = roomsObject.rooms.indexOf(room!);
                        const userIndex: number = roomsObject.rooms[roomIndex].users.indexOf(user!);
        
                        roomsObject.rooms[roomIndex].users.splice( userIndex, 1 );
        
                        Files.writeFile( this._database, roomsObject );
        
                        this._io.to(code).emit('online-users', room?.users);

                        if ( room?.users.length === 0 ) {
                            roomsObject.rooms.splice(roomIndex, 1);
                            Files.writeFile(this._database, roomsObject);
                        }
                        //console.log(`user ${ socket.id } disconnected`); //? Debug
                        
                    });
                } else {
                    socket.emit('error', 'The room you are searching for, doesn\'t exist.');
                }
            });

            socket.on('create-room', ( { username, code } ) => {
                const rooms: Rooms = JSON.parse(Files.readFile(this._database));
                
                const roomExists = rooms.rooms.find( e => e.code === code );

                if ( !roomExists ) {
                    rooms.rooms.push({
                        code,
                        users: []
                    });

                    Files.writeFile(this._database, rooms);
                }
            });

            socket.on('message', ( { username, message } ) => {

                if ( message.trim().length !== 0 )
                    this._io.to(codeRoom).emit( 'new-message', { id: socket.id, username, message } );
            });

            socket.on('disconnect', () => {

                //console.log(`user ${ socket.id } disconnected`); //? Debug
                
            });
        });
    }

    public runServer(): void {
        this._io.listen(Number(this._port));
    }

}

export default Server;