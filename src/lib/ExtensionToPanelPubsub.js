import Pubsub from './Pubsub';

export default class ExtensionToPanelPubsub extends Pubsub {
  constructor(browserRuntime) {
    super();
    const setupConnection = () => {
      this.connectionPromise = new Promise(resolve => {
        console.log('setting up connection to panel');
        browserRuntime.onConnect.addListener(devToolsConnection => {
          console.log('connection to panel established!');
          const devToolsListener = request => {
            console.log(
              `extension received message ${request.type}`,
              request.message,
            );
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

  async pub(topic, message = {}) {
    this.notifySubscribers(topic, message);
    console.log('publishing from extension to panel we need connection first');
    const conn = await this.connectionPromise;
    console.log('we now have connection to the panel, we can publish', {
      topic,
      message,
    });
    return conn.postMessage({ type: topic, message });
  }
}
