import { startHermesWS, setHermesConfig, generateJWTToken, generateSecretKey } from '../index.js';
import { onMessageChannelHandler, onAnnouncementChannelHandler } from './eventHandlers.js';

setHermesConfig('jwtSecret', '<your-jwt-secret>');
setHermesConfig('customHeader', 'HEADER_NAME:HEADER_VALUE')
// setHermesConfig('validApiKeys', ['apikey1','apikey2'])

const { expressApp, hermesWS } = await startHermesWS({
  httpPort: 3000,
  httpOptions: {
    auth_middleware_types: ['jwt', 'custom-header']
  },
  wsOptions: {
    cors_origin: ['http://127.0.0.1:5500', 'http://127.0.0.1:8000'],
    auth_middleware_types: ['jwt', 'custom-header']
  }
});

async function onConnect (ws, socket){
    console.log('Custom handler: New client connected with ID:', socket.id)
    ws.broadcastMessage('message', 'HI I am Server1')
};

async function onDisconnect(ws, socket, reason){
    console.log(`Custom handler: Client with ID-${socket.id} disconnected. Reason:`, reason);
};

hermesWS.setOnConnect(onConnect)
hermesWS.setOnDisconnect(onDisconnect)

hermesWS.start()

hermesWS.addEventHandler('message', onMessageChannelHandler);
hermesWS.addEventHandler('announcement', onAnnouncementChannelHandler);

expressApp.get('/custom-endpoint', (req, res) => {
  res.send('Hello from custom endpoint!');
});

