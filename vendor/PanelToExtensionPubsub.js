import Pubsub from '../js/Pubsub';

export default class PanelToExtensionPubsub extends Pubsub {
  constructor() {
    super();
    const connectToBackgroundPage = () => {
      console.log('Connecting to extension');
      this.backgroundPageConnection = chrome.runtime.connect({
        name: 'devtools-page'
      });
      console.log('connected to extension');

      const messageListener = (request, sender, sendResponse) => {
        console.log('panel received message ' + request.type, request.message);
        console.log('substribers are', this.handlers);
        this.notifySubscribers(request.type, request.message);
      };

      this.backgroundPageConnection.onMessage.addListener(messageListener);
      this.backgroundPageConnection.onDisconnect.addListener(() => {
        this.backgroundPageConnection.onMessage.removeListener(messageListener);
        connectToBackgroundPage();
      });
    };
    connectToBackgroundPage();
  }
  pub(topic, message = {}) {
    console.log('publishing from panel to extension '+topic, message);
    this.notifySubscribers(topic, message);
    console.log('all local subscribers were notified, now posting to background page connection');
    this.backgroundPageConnection.postMessage({
      type: topic,
      message
    });
  }
}
