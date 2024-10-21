import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from 'dotenv';
import HermesWS from "./HermesWS.js";
import {
    http_apiKeyMiddleware,
    http_jwtAuthMiddleware,
    http_customHeaderMiddleware, 
    ws_jwtAuthMiddleware
} from "./middlewares.js";
import { generateJWTToken } from "./utils.js";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET
const [CUSTOM_HEADER_NAME, CUSTOM_HEADER_VALUE] = process.env.CUSTOM_HEADERS.split(':')

console.log('JWT_SECRET ', JWT_SECRET)
console.log('CUSTOM_HEADER_NAME ', CUSTOM_HEADER_NAME)
console.log('CUSTOM_HEADER_VALUE ', CUSTOM_HEADER_VALUE)
console.log('generateJWTToken ', generateJWTToken())

export function startHermesWS({ httpPort = 3000, httpOptions = {}, wsOptions = {} }) {
    let host = '0.0.0.0'

    // Express HTTP Server
    const expressApp = express();
    expressApp.use(express.json());
    expressApp.use(cors({
        origin: httpOptions.origin || '*',
        methods: httpOptions.methods || ['GET', 'POST'],
        credentials: httpOptions.credentials || true,
    }));
    // expressApp.use(apiKeyMiddleware);
    // expressApp.use(customHeaderMiddleware);

    const server = createServer(expressApp);

    // Test endpoint
    expressApp.get('/test', async (req, res) => {
        res.json({ 'hello': 'world' });
    });

    // SocketIO WebSocket server - attach the SocketIO WebSocket server to the same HTTP server
    const wsServerObj = new Server(server, {
        cors: {
            origin: 'http://127.0.0.1:5500',
            allowedHeaders: undefined,
            credentials: true
        },
        allowRequest: (req, callback) => {
            const hasCustomHeader = req.headers[CUSTOM_HEADER_NAME] !== undefined;
            const validCustomHeaderValue = req.headers[CUSTOM_HEADER_NAME] === CUSTOM_HEADER_VALUE;
            console.log('hasCustomHeader && validCustomHeaderValue ', hasCustomHeader && validCustomHeaderValue)
            callback(null, hasCustomHeader && validCustomHeaderValue);
        },
        ...wsOptions
    });

    // Middleware for authenticating the socket
    wsServerObj.use(ws_jwtAuthMiddleware)


    // Initialize WebSocket server using HermesWS
    const wss = new HermesWS(wsServerObj)
    wss.start()

    server.listen(httpPort, host, () => {
        console.log(`Server is listening on ${httpPort} for both HTTP and WebSocket!`);
    }).on('error', (err) => {
        console.log('Server Error:', err);
    });

    return { expressApp, wsServerObj };
}

// Check if the current module is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
    startHermesWS({
        httpPort: 3000,
        httpOptions: {},
        wsOptions: {},
    });
}


