"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const Server_1 = __importDefault(require("./models/Server"));
const server = new Server_1.default(process.env.PORT || '8080');
server.setCors();
server.sockets();
server.runServer();
