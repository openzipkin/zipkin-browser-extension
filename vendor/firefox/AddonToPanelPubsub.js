const {MessageChannel} = require("sdk/messaging");
import Pubsub from '../../js/Pubsub';

// A pub-sub implementation for Firefox addons that talk to their child panels
export default class AddonToPanelPubsub extends Pubsub {
  constructor(panel) {
    super();
    const channel = new MessageChannel();
    this.ports = {
      addonSide: channel.port1,
      panelSide: channel.port2
    };

    this.ports.addonSide.onmessage = event => {
      if (event.data && event.data.topic && event.data.message) {
        console.log('Addon received event from panel', event.data);
        const {topic, message} = event.data;
        // console.log('handlers are', this.handlers[topic]);
        this.notifySubscribers(topic, message);
      } else {
        console.log('the event missed some fields, probably not a zipkin pubsub message.', event);
      }
    };

    console.log('HELLO PANEL, TRYING TO INIT', this.ports);
    panel.postMessage('init', [this.ports.panelSide]);
  }
  pub(topic, message = {}) {
    this.notifySubscribers(topic, message);
    // console.log('now posting message to panel', {topic, message});
    this.ports.addonSide.postMessage({topic, message});
    this.ports.panelSide.postMessage({topic, message});
  }
}
