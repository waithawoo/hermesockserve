import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

import HermesWS from "./HermesWS.js";

let ws_port = 3000
let http_port = 5000;
let host = '0.0.0.0'

// TODO : need to change that currently using two differnet ports for Express and Websocket

// Express HTTP Server
const expressApp = express();
const expressServer = createServer(expressApp);

expressApp.get('/test', async (req, res) => {
    res.json({ 'hello': 'world' });
});

expressServer.listen(http_port, host, () => {
    console.log(`expressServer server is listening on ${http_port}!`);

}).on('error', (err) => {
    console.log('expressServer Error:', err);
});

// SocketIO WebSocket Server
const wsServer = createServer();
const wsServerObj = new Server(wsServer, {
    cors: {
        // origin: "http://127.0.0.1/:5500", // TODO : CORS is still not working
        origin: '*'
    },
});

const wss = new HermesWS(wsServerObj)
wss.start()

wsServer.listen(ws_port, () => {
    console.log(`wsServer server is listening on ${ws_port}!`);
}).on('error', (err) => {
    console.log('wsServer Error:', err);
});


