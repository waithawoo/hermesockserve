import { startHermesWS, setConfig, generateJWTToken, generateSecretKey } from '../index.js';
import { onMessageChannelHandler, onAnnouncementChannelHandler } from './eventHandlers.js';

setConfig('jwtSecret', '28beb44330ca2954db963091b749627532c831294f68d3618967e82c458527ad')
setConfig('customHeader', 'x-custom-service:ABCLARA1faeed5ac7f0c784a490e9d4710796121c3a3ddbd84ac45ea5bd94249b185352')
setConfig('validApiKeys', ['a7365c126e9550014949e4b5178b2fdadfd6d5a9e8442da0cfbc92168830ef3a','26c87d358bd390f456e08b282c5d4c573972ef559f523eca4cb88eda02f68ee9'])

const { expressApp, hermesWS } = await startHermesWS({
  httpPort: 3000,
  httpOptions: {
    auth_middleware_types: ['jwt', 'custom-header']
  },
  wsOptions: {
    cors_origin: ['http://127.0.0.1:5500', 'http://127.0.0.1:8000'],
    auth_middleware_types: ['jwt', 'custom-header']
  },
  dbConfig: { dbFile: './mydb.sqlite' }
});


let jwttoken = generateJWTToken()
let secretKEY = generateSecretKey()
// console.log('jwt token ', jwttoken)
// console.log('secretKEY ', secretKEY)

async function onConnect (socket){
    console.log('Custom handler: New client connected with ID:', socket.id)
    this.broadcastMessage('message', 'HI I am Server1')
};

async function onDisconnect(socket, reason){
    console.log(`Custom handler: Client with ID-${socket.id} disconnected. Reason:`, reason);
};

hermesWS.setOnConnect(onConnect)
hermesWS.setOnDisconnect(onDisconnect)

hermesWS.start()

await hermesWS.DB().createTable('notifications', [
    'id INTEGER PRIMARY KEY AUTOINCREMENT',
    'sender_id TEXT',
    'receiver_id TEXT',
    'data TEXT'
]);


hermesWS.addEventHandler('message', onMessageChannelHandler);
hermesWS.addEventHandler('announcement', onAnnouncementChannelHandler);

expressApp.get('/custom-endpoint', (req, res) => {
  res.send('Hello from custom endpoint!');
});

