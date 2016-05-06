export default function addNetworkEvents(network, pubsub) {
  network.onNavigated.addListener(() => {
    pubsub.pub('navigated');
  });
  network.onRequestFinished.addListener(request => {
    pubsub.pub('requestFinished', {
      headers: request.request.headers,
      url: request.request.url
    });
  });
}
