export default function addNetworkEvents(network, pubsub) {
  network.onNavigated.addListener(() => {
    pubsub.pub('navigated');
  });
  // https://bugzilla.mozilla.org/show_bug.cgi?id=1311171
  network.onRequestFinished && network.onRequestFinished.addListener(request => {
    pubsub.pub('requestFinished', {
      headers: request.request.headers,
      url: request.request.url
    });
  });
}
