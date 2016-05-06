const tabs = require('sdk/tabs');

export default function addNetworkEvents({pubsub}) {
  tabs.on('*', e => {
    console.log('tabs fired event', e);
  });

  tabs.on('ready', () => {
    console.log('navigated!!');
    pubsub.pub('navigated', {});
  });
  /*
  console.log('adding network events');
  network.onNavigated.addListener(() => {
    console.log('on navigated!');
    pubsub.pub('navigated');
  });
  network.onRequestFinished.addListener(request => {
    console.log('request finished!', request);
    pubsub.pub('requestFinished', {
      headers: request.request.headers,
      url: request.request.url
    });
  });
  */
}
