export default class HermesWS {
    
    constructor(WebSocketServer) {
        this.wss = WebSocketServer;
    }

    start() {
        this.wss.on('connection', async (socket) => {
            let sid = socket.id
            console.log('New client connected - ', sid);

            const sockets = await this.wss.fetchSockets();

            // console.log('sockets ', sockets)
            // console.log('socket cl ', sockets[0].client)

            // Handle incoming messages from the client with a custom channel called 'message' 
            socket.on('message', async (message) => {
                console.log(`Received message: ${message}`);
                await this.#broadcast('I am Server');
            });

            socket.on("disconnect", (reason) => {
                console.log('Client disconnected', reason);
            });

            socket.conn.on("close", (reason) => {
                console.log('Client closeed', reason);
            });
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

    #sendMessage(socketID, message) {
        if (socketID.readyState === WebSocket.OPEN) {
            this.wss.to(socketID).emit('message', message)
        }
    }
}
