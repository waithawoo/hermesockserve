# Hermesockserve

A Modular Websocket Server and HTTP API for real-time notifications using socket.io.

HermesWS is a WebSocket server with an HTTP API for sending real-time notifications. This package combines both WebSocket and HTTP servers into one and can be used in any backend or frontend setup.

## Installation

To install it via npm:

```bash
npm install hermesockserve
```

To run with docker:

```bash
docker build -t hermesockserve .
docker run -p 3000:3000 --name hermesockserve hermesockserve
```

## Usage

```js
// Import the required functions
import { startHermesWS, setConfig, generateJWTToken, generateSecretKey } from 'hermesockserve';

// ---- Server Setup
// Setup WebSocket and HTTP servers with necessary configurations
const { expressApp, hermesWS } = await startHermesWS({
  httpPort: 3000, // This port will serve for Http and Websocket servers
  httpOptions: {
    auth_middleware_types: ['jwt', 'custom-header'] // Can use 3 types : 'api-key', 'jwt' and 'custom-header'
  },
  wsOptions: {
    auth_middleware_types: ['jwt', 'custom-header'] // Can use 3 types : 'api-key', 'jwt' and 'custom-header'
  },
  dbConfig: { dbFile: './mydb.sqlite' } // set 'null' in case of that Database is not needed
});

// Setup the required configuration values for middlewares
// Recommend load from .env for all config values for security concerns
setConfig('jwtSecret', 'JWT_SECRET')
setConfig('customHeader', 'HEADER_NAME:HEADER_VALUE') // ':' must be used for delimiter
setConfig('validApiKeys', ['apikey1','apikey2']) // Must be array type

// Start the main Hermes Server
hermesWS.start()

// ---- Databases
// Create create tables as needed
await hermesWS.DB().createTable('notifications', [
    'id INTEGER PRIMARY KEY AUTOINCREMENT',
    'sender_id TEXT',
    'receiver_id TEXT',
    'data TEXT',
]);


await hermesWS.DB().insert(tableName, data) // tableName : string, data : json
await hermesWS.DB().query(tableName, conditions) // tableName : string, condidtion : json

// ---- Websocket - Custom Events handlers and Channels

// You can also add Custom Event Handlers for custom channels as follows. 
// ---- Define event handlers
function onMessageChannelHandler(socket, message){
    console.log(`Received message in onMessageChannelHandler from ${socket.id}: ${message}`);
};
async function onAnnouncementChannelHandler(socket, message) {
    console.log(`Received message in onAnnouncementChannelHandler from ${socket.id}: ${message}`);
};
// ---- Register custom event handlers
hermesWS.addEventHandler('message', onMessageChannelHandler);
hermesWS.addEventHandler('announcement', onAnnouncementChannelHandler);

// Can use the hermesWS instance as 'this' in event handler functions
function onMessageChannelHandler(socket, message){
    console.log(`Received message in onMessageChannelHandler from ${socket.id}: ${message}`);

    this.broadcastMessage('announcement', 'I am Server')
};
// ---- Http - Custom API endpoints
// Add custom http routes if needed
expressApp.get('/custom-endpoint-1', (req, res) => {
  res.send('Hello from custom endpoint 1!');
});
```
