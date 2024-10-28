import Database from "./db/Database.js";
export default class HermesWS {
    #db = null;
    #eventHandlers = new Map();
    #connectedSockets = new Map();
    #onConnect = null;
    #onDisconnect = null;

    constructor(WebSocketServer, serverConfig, dbConfig = null) {
        this.wss = WebSocketServer;
        this.#db = Database.createDatabase('sqlite', dbConfig)
        this.serverConfig = serverConfig
        this.started = false;
    }

    #applyEventHandlers(socket) {
        this.#eventHandlers.forEach((handler, eventName) => {
            socket.on(eventName, handler.bind(this, socket));
        });
    }

    async #broadcast(channel, message, socketIds = []) {
        if(socketIds.length == 0){
            socketIds = await this.wss.allSockets();
        }
        socketIds.forEach((socketID) => {
            if(this.#connectedSockets.get(socketID).connected) {
                this.wss.to(socketID).emit(channel, message)
            }
        });
    }

    async #sendMsg(socketID, message, channel = 'message') {
        if(this.#connectedSockets.get(socketID).connected) {
            this.wss.to(socketID).emit(channel, message)
        }
    }

    #checkForArrowFunction(handler, handlerName = null) {
        if (typeof handler === 'function') {
            if (!handler.prototype && handler.toString().includes('=>')) {
                throw new Error(`${handlerName || handler.name} is an arrow function. Use a regular function to ensure 'this' binds correctly.`);
            }
            return handler.bind(this);
        }
        throw new Error(`The handler has to be a function , not ${typeof handler}`);
    }

    setOnConnect(onConnect = null) {
        this.#checkForArrowFunction(onConnect)
        this.#onConnect = onConnect.bind(this)
    }

    setOnDisconnect(onDisconnect = null) {
        this.#checkForArrowFunction(onDisconnect)
        this.#onDisconnect = onDisconnect.bind(this)
    }

    async start() {
        if(this.started){
            throw new Error('HermesWS already started.')
        }
        if(!this.#onConnect || !this.#onDisconnect){
            throw new Error('Please set both onConnect and onDisconnect handlers before start.')
        }

        this.serverConfig.server.listen(this.serverConfig.httpPort, this.serverConfig.host, () => {
            this.started = true;
            console.log(`HermesWS Server is listening on ${this.serverConfig.httpPort} for both HTTP and WebSocket!`);
        }).on('error', async(err) => {
            console.log('Server Error:', err);
            await this.close();
        });

        if(this.#db){
            await this.#db.connect();
            console.log(' Database connected.');
        }

        this.wss.on('connection', async (socket) => {
            let sid = socket.id
            this.#connectedSockets.set(socket.id, socket);

            if (typeof this.#onConnect === 'function') {
                this.#onConnect(socket);
            }
            
            this.#applyEventHandlers(socket);
            
            // Default channel 'message' to handle incoming  messages from the clients
            socket.on('message', async (message) => {
            });

            socket.on("disconnect", (reason) => {
                this.#connectedSockets.delete(socket.id);
                if (typeof this.#onDisconnect === 'function') {
                    this.#onDisconnect(socket, reason);
                }
            });

            socket.conn.on("close", (reason) => {
                this.#connectedSockets.delete(socket.id);
                if (typeof this.#onDisconnect === 'function') {
                    this.#onDisconnect(socket, reason);
                }
            });
        });
    }

    addEventHandler(eventName, handler) {
        this.#checkForArrowFunction(handler)
        this.#eventHandlers.set(eventName, handler.bind(this));
    }

    async fetchSockets(){
        const sockets = await this.wss.fetchSockets();
        return sockets
    }

    DB() {
        if(this.#db){
            return this.#db;
        }
        throw new Error('db instance is null')
    }

    async broadcastMessage(channel, message, socketIds) {
        await this.#broadcast(channel, message, socketIds);
    }

    async sendMessage(socketID, message, channel) {
        await this.#sendMsg(socketID, message, channel);
    }

    async close() {
        this.started = false
        if(this.#db){
            await this.#db.close();
        }
    }
}


