import dotenv from 'dotenv';
dotenv.config();

import Server from './models/Server';

const server: Server = new Server( process.env.PORT || '8080' );

server.setCors();

server.sockets();

server.runServer();