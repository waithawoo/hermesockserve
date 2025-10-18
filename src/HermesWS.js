export default class HermesWS {
    #eventHandlers = new Map();
    #connectedSockets = new Map();
    #onConnect = null;
    #onDisconnect = null;

    constructor(WebSocketServer, serverConfig) {
        this.wss = WebSocketServer;
        this.serverConfig = serverConfig;
        this.started = false;
    }

    #applyEventHandlers(socket) {
        this.#eventHandlers.forEach((handler, eventName) => {
            socket.on(eventName, (...args) => handler(this, socket, ...args));
        });
    }

    async #broadcast(channel, message, socketIds = []) {
        if (socketIds.length === 0) {
            socketIds = await this.wss.allSockets();
        }
        socketIds.forEach((socketID) => {
            const socket = this.#connectedSockets.get(socketID);
            if (socket && socket.connected) {
                this.wss.to(socketID).emit(channel, message);
            }
        });
    }

    async #sendMsg(socketID, message, channel = 'message') {
        const socket = this.#connectedSockets.get(socketID);
        if (socket && socket.connected) {
            this.wss.to(socketID).emit(channel, message);
        }
    }

    #validateHandler(handler) {
        if (typeof handler !== 'function') {
            throw new Error(`The handler has to be a function, not ${typeof handler}`);
        }
        return handler;
    }

    setOnConnect(onConnect = null) {
        if (onConnect) {
            this.#onConnect = (socket, ...args) => onConnect(this, socket, ...args);
        }
    }

    setOnDisconnect(onDisconnect = null) {
        if (onDisconnect) {
            this.#onDisconnect = (socket, ...args) => onDisconnect(this, socket, ...args);
        }
    }

    async start() {
        if (this.started) throw new Error('HermesWS already started.');
        if (!this.#onConnect || !this.#onDisconnect) {
            throw new Error('Please set both onConnect and onDisconnect handlers before start.');
        }

        this.serverConfig.server.listen(this.serverConfig.httpPort, this.serverConfig.host, () => {
            this.started = true;
            console.log(`HermesWS Server is listening on ${this.serverConfig.httpPort} for both HTTP and WebSocket!`);
        }).on('error', async (err) => {
            console.log('Server Error:', err);
            await this.close();
        });

        this.wss.on('connection', (socket) => {
            this.#connectedSockets.set(socket.id, socket);

            if (this.#onConnect) this.#onConnect(socket);
            this.#applyEventHandlers(socket);
            
            // Default channel 'message' to handle incoming  messages from the clients
            socket.on('message', async (message) => {
            });

            const cleanup = (reason) => {
                this.#connectedSockets.delete(socket.id);
                if (this.#onDisconnect) this.#onDisconnect(socket, reason);
            };

            socket.on('disconnect', cleanup);
            socket.conn.on('close', cleanup);
        });
    }

    addEventHandler(eventName, handler) {
        const safeHandler = this.#validateHandler(handler);
        this.#eventHandlers.set(eventName, safeHandler);
    }

    async fetchSockets() {
        return await this.wss.fetchSockets();
    }

    async broadcastMessage(channel, message, socketIds) {
        await this.#broadcast(channel, message, socketIds);
    }

    async sendMessage(socketID, message, channel) {
        await this.#sendMsg(socketID, message, channel);
    }

    async connectedSocketsCount() {
        return this.#connectedSockets.size;
    }

    async connectedSocketIds() {
        return Array.from(this.#connectedSockets.keys());
    }

    async connectedSocketState(socketID) {
        const socket = this.#connectedSockets.get(socketID);
        if (!socket) throw new Error(`Socket with ID ${socketID} not found.`);
        return socket.connected;
    }

    async close() {
        this.started = false;
    }
}
