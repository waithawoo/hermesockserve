import Database from "./db/Database.js";
export default class HermesWS {
    #db = null;
    #eventHandlers = new Map();
    #connectedSockets = new Set();

    constructor(WebSocketServer, serverConfig, dbConfig = null) {
        this.wss = WebSocketServer;
        this.#db = Database.createDatabase('sqlite', dbConfig)
        this.serverConfig = serverConfig
        this.started = false;
    }

    #applyEventHandlers(socket) {
        // console.log('applying EventHandlers')
        this.#eventHandlers.forEach((handler, eventName) => {
            socket.on(eventName, handler.bind(this, socket));
        });
    }

    async #broadcast(channel, message, socketIds = []) {
        if(socketIds.length == 0){
            socketIds = await this.wss.allSockets();
        }
        // console.log('socketIds ', socketIds)
        socketIds.forEach((socketID) => {
            if(socketID.readyState === WebSocket.OPEN) {
            this.wss.to(socketID).emit(channel, message)
            }
        });
    }

    async #sendMsg(socketID, message, channel = 'message') {
        if(socketID.readyState === WebSocket.OPEN) {
            this.wss.to(socketID).emit(channel, message)
        }
    }

    async start() {
        if(this.started){
            throw new Error('HermesWS already started.')
        }
        console.log('---- HermesWS started')

        this.serverConfig.server.listen(this.serverConfig.httpPort, this.serverConfig.host, () => {
            this.started = true;
            console.log(`Server is listening on ${this.serverConfig.httpPort} for both HTTP and WebSocket!`);
        }).on('error', async(err) => {
            console.log('Server Error:', err);
            await this.close();
        });

        if(this.#db){
            await this.#db.connect();
        }
        console.log('---- Database connected and table created.');

        this.wss.on('connection', async (socket) => {
            let sid = socket.id
            this.#connectedSockets.add(socket);
            console.log('---- New client connected - ', sid);

            this.#applyEventHandlers(socket);
            
            // Default channel 'message' to handle incoming  messages from the clients
            socket.on('message', async (message) => {
            });

            socket.on("disconnect", (reason) => {
                this.#connectedSockets.delete(socket);
                console.log('Client disconnected : ', reason);
            });

            socket.conn.on("close", (reason) => {
                this.#connectedSockets.delete(socket);
                console.log('Client closed : ', reason);
            });
        });
    }

    addEventHandler(eventName, handler) {
        // console.log('Adding EventHandlers')
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
        return null;
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
            console.log('Database connection closed.');
        }
    }
}


