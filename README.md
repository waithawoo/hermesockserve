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
import { startHermesWS } from 'hermesockserve';

// Start WebSocket and HTTP servers
const { expressApp, wsServerObj } = startHermesWS({
  httpPort: 3000, // HTTP and WebSocket will share this port
  wsOptions: { cors: { origin: '*' } }, // Optional Socket.IO options
});

// Add custom Express routes if needed
expressApp.get('/custom-endpoint', (req, res) => {
  res.send('Hello from custom endpoint!');
});
```
