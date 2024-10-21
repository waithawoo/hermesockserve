import { startHermesWS } from './index.js';

// Start WebSocket and HTTP servers
const { expressApp, wsServerObj } = startHermesWS({
  httpPort: 3000, // HTTP and WebSocket will share this port
  wsOptions: { cors: { origin: '*' } }, // Optional Socket.IO options
});

// Add custom Express routes if needed
expressApp.get('/custom-endpoint', (req, res) => {
  res.send('Hello from custom endpoint!');
});
