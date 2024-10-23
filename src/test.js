import { startHermesWS, setConfig } from './index.js';
import { onMessageHandler, onCustomEventHandler } from './eventHandlers.js';

setConfig('jwtSecret', 'xxxx')
setConfig('customHeader', 'xxx,xxx')
setConfig('validApiKeys', ['xxx','xxx'])

const { expressApp, hermesWS } = await startHermesWS({
  httpPort: 3000,
  httpOptions: {
    auth_middleware_types: ['jwt', 'custom-header']
  },
  wsOptions: {
    auth_middleware_types: ['jwt', 'custom-header']
  },
  dbConfig: { dbFile: './mydb.sqlite' }
});

hermesWS.addEventHandler('hellowai', onMessageHandler);
hermesWS.addEventHandler('custom_event', onCustomEventHandler);
hermesWS.start()

expressApp.get('/custom-endpoint', (req, res) => {
  res.send('Hello from custom endpoint!');
});

