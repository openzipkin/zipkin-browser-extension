import Pubsub from '../../js/Pubsub';

// A pub-sub implementation for Firefox panels that talk their parent add-on
export default class PanelToAddonPubsub extends Pubsub {
  constructor(window) {
    super();
    this.toAddonPort = new Promise((resolve, reject) => {
      window.addEventListener('message', event => {
        console.log('GOT EVENT FROM ADDON', event);
        console.log('First port is', event.ports[0]);
        console.log('Second port is', event.ports[1]);
        const toAddon = event.ports[0];
        toAddon.start();
        resolve(toAddon);

        toAddon.onmessage = event => {
          console.log('Panel received event from addon', event);
          if (event.data && event.data.topic && event.data.message) {
            const {topic, message} = event.data;
            console.log('handlers are', this.handlers[topic]);
            this.notifySubscribers(topic, message);
          } else {
            console.log('the event missed some fields, probably not a zipkin pubsub message.', event);
          }
        };

        /*
        if (event.topic && event.message) {
          console.log('Panel received message from addon', event);
          const {topic, message} = event;
          this.notifySubscribers(topic, message);
        } else {
          console.log('The event was missing some fields, probably not a zipkin pubsub message.', event);
        }
        */
      });
    });
  }
  pub(topic, message = {}) {
    // console.log('trying to publish '+topic, message);
    this.notifySubscribers(topic, message);
    this.toAddonPort.then(addonPort => addonPort.postMessage({topic, message}));
  }
}
