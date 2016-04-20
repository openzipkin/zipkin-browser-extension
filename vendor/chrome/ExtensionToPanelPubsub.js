import Pubsub from '../../js/Pubsub';

export default class ExtensionToPanelPubsub extends Pubsub {
  constructor(chromeRuntime) {
    super();
    const setupConnection = () => {
      this.connectionPromise = new Promise((resolve, reject) => {
        console.log('setting up connection to panel');
        chromeRuntime.onConnect.addListener(devToolsConnection => {
          console.log('connection to panel established!');
          const devToolsListener = (request, sender, sendResponse) => {
            console.log('extension received message ' + request.type, request.message);
            this.notifySubscribers(request.type, request.message);
          };
          devToolsConnection.onMessage.addListener(devToolsListener);
          devToolsConnection.onDisconnect.addListener(() => {
            console.log('WE DISCONNECTED!');
            devToolsConnection.onMessage.removeListener(devToolsListener);
            setupConnection();
          });
          resolve(devToolsConnection);
        });
      });
    };
    setupConnection();
  }

  pub(topic, message = {}) {
    this.notifySubscribers(topic, message);
    console.log('publishing from extension to panel we need connection first');
    return this.connectionPromise.then(conn => {
      console.log('we now have connection to the panel, we can publish', {topic, message});
      return conn.postMessage({type: topic, message});
    });
  }
}
