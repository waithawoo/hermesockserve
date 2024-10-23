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
        console.log('applying EventHandlers')

        this.#eventHandlers.forEach((handler, eventName) => {
            socket.on(eventName, handler.bind(this, socket));
        });
    }

    async #broadcast(message) {
        const socketIds = await this.wss.allSockets();
        console.log('socketIds ', socketIds)
        socketIds.forEach((socketID) => {
            console.log('sending to ', socketID);
            this.wss.to(socketID).emit('message', message)
        });
    }

    async #sendMsg(socketID, message) {
        if (socketID.readyState === WebSocket.OPEN) {
            this.wss.to(socketID).emit('message', message)
        }
    }

    async start() {
        if(this.started){
            throw new Error('HermesWS already started.')
        }
        console.log('HermesWS started')

        this.serverConfig.server.listen(this.serverConfig.httpPort, this.serverConfig.host, () => {
            this.started = true;
            console.log(`Server is listening on ${this.serverConfig.httpPort} for both HTTP and WebSocket!`);
        }).on('error', async(err) => {
            console.log('Server Error:', err);
            await this.close();
        });

        if(this.#db){
            await this.#db.connect();

            await this.#db.createTable('users', [
                'id INTEGER PRIMARY KEY AUTOINCREMENT',
                'name TEXT',
                'email TEXT',
                'message'
            ]);
        }
        console.log('Database connected and table created.');

        this.wss.on('connection', async (socket) => {
            let sid = socket.id
            this.#connectedSockets.add(socket);
            console.log('New client connected - ', sid);

            this.#applyEventHandlers(socket);

            if(this.#db){
                await this.test_handleUserData({ name: 'John Doe 1', email: 'john@example.com' })
            }

            // Handle incoming messages from the client with a custom channel called 'message' 
            socket.on('message', async (message) => {
                console.log(`Received message: ${message}`);
                // await this.#broadcast('I am Server');
            });

            socket.on("disconnect", (reason) => {
                this.#connectedSockets.delete(socket);
                console.log('Client disconnected ', reason);
            });

            socket.conn.on("close", (reason) => {
                this.#connectedSockets.delete(socket);
                console.log('Client closed ', reason);
            });
        });
    }

    addEventHandler(eventName, handler) {
        console.log('Adding EventHandlers')
        this.#eventHandlers.set(eventName, handler.bind(this));
    }

    async fetchSockets(){
        const sockets = await this.wss.fetchSockets();
        return sockets
    }

    async test_handleUserData(userData) {
        try {
            const userId = await this.#db.insert('users', userData);
            console.log(`User inserted with ID: ${userId}`);
        } catch (err) {
            console.error('Error inserting user:', err);
        }
    }

    DB() {
        if(this.#db){
            return this.#db;
        }
        return null;
    }

    async broadcastMessage(message) {
        await this.#broadcast(message);
    }

    async sendMessage(socketID, message) {
        await this.#sendMsg(socketID, message);
    }

    async close() {
        this.started = false
        if(this.#db){
            await this.#db.close();
            console.log('Database connection closed.');
        }
    }
}


