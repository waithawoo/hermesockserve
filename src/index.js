import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import HermesWS from "./HermesWS.js";
import { _generateSecretKey, _generateJWTToken } from "./utils.js";

import { createHttpMiddlewares, createWsMiddlewares } from "./middlewares.js";

const config = {
    jwtSecret: null,
    customHeader: null,
    validApiKeys: []
};

export function setHermesConfig(key, value) {
    if (key in config) {
        config[key] = value;
    } else {
        throw new Error(`Invalid configuration key: ${key}`);
    }
}

export function generateSecretKey(length = 32){
    return _generateSecretKey(length)
}

export function generateJWTToken(payload, expiresIn = "7 days"){
    const { jwtSecret, customHeader, validApiKeys } = config;
    if (!jwtSecret) {
        throw new Error("JWT Secret is required");
    }
    return _generateJWTToken(jwtSecret, payload, expiresIn)
}

export async function startHermesWS({ httpPort = 3000, httpOptions = {}, wsOptions = {}, dbConfig = null }) {
    
    const { jwtSecret, customHeader, validApiKeys } = config;

    if (!jwtSecret) {
        throw new Error("JWT Secret is required");
    }

    if (!customHeader) {
        throw new Error("Custom header is required");
    }

    const httpMiddlewaresConfig = {
        'api-key': createHttpMiddlewares['api-key'](validApiKeys),
        'jwt': createHttpMiddlewares['jwt'](jwtSecret),
        'custom-header': createHttpMiddlewares['custom-header'](customHeader)
    };

    const wsMiddlewaresConfig = {
        'api-key': createWsMiddlewares['api-key'](validApiKeys),
        'jwt': createWsMiddlewares['jwt'](jwtSecret),
        'custom-header': createWsMiddlewares['custom-header'](customHeader)
    };

    let host = '0.0.0.0'

    // Express HTTP Server
    const expressApp = express();
    expressApp.use(express.json());
    expressApp.use(cors({
        origin: httpOptions.origin || '*',
        methods: httpOptions.methods || ['GET', 'POST'],
        credentials: httpOptions.credentials || true,
    }));

    // HTTP middelewares
    if (httpOptions.auth_middleware_types) {
        httpOptions.auth_middleware_types.forEach(each => {
            if (!httpMiddlewaresConfig[each]) {
                throw new Error(`Invalid http middleware type: ${each}`);
            }
            expressApp.use(httpMiddlewaresConfig[each]);
        });
    }

    const server = createServer(expressApp);

    // Test endpoint
    // expressApp.get('/test', async (req, res) => {
    //     res.json({ 'hello': 'world' });
    // });

    // SocketIO WebSocket server - attach the SocketIO WebSocket server to the same HTTP server
    const wsServerObj = new Server(server, {
        cors: {
            // origin: ['http://127.0.0.1:5500', 'http://127.0.0.1:8000'],
            origin: wsOptions.cors_origin || ['*'],
            methods: wsOptions.cors_methods || ['GET', 'POST'],
            allowedHeaders: undefined, // currently fixed
            credentials: wsOptions.cors_credentials || true,
        },
        allowRequest: wsMiddlewaresConfig['custom-header'],
        ...wsOptions
    });

    // Socket middelewares
    if (wsOptions.auth_middleware_types) {
        wsOptions.auth_middleware_types.forEach(each => {
            if (!wsMiddlewaresConfig[each]) {
                throw new Error(`Invalid ws middleware type: ${each}`);
            }
            wsServerObj.use(wsMiddlewaresConfig[each]);
        });
    }

    // Initialize WebSocket server using HermesWS
    const serverConfig = {
        server: server,
        httpPort: httpPort,
        host: host
    }
    const hermesWS = new HermesWS(wsServerObj, serverConfig, dbConfig)

    process.on('SIGINT', async () => {
        console.log('Shutting down server...');
        await hermesWS.close();
        process.exit(0);
    });

    process.on('SIGTERM', async () => {
        console.log('Shutting down server...');
        await hermesWS.close();
        process.exit(0);
    });

    return { expressApp, hermesWS };
}
