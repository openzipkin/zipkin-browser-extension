import ExtensionToPanelPubsub from './lib/ExtensionToPanelPubsub';
import { RemoteStorageClient } from './lib/RemoteStorage';
import { RemoteSetIntervalClient } from './lib/RemoteSetInterval';
import ZipkinPlugin from './lib/ZipkinPlugin';

import attachBeforeSendHeadersListener from './lib/attachBeforeSendHeadersListener';

attachBeforeSendHeadersListener(browser.webRequest);

const pubsub = new ExtensionToPanelPubsub(browser.runtime);
const storage = new RemoteStorageClient(pubsub);
const remoteSetInterval = new RemoteSetIntervalClient(pubsub);
// eslint-disable-next-line no-new
new ZipkinPlugin({
  pubsub,
  storage,
  setInterval: remoteSetInterval.setInterval,
  clearInterval: remoteSetInterval.clearInterval,
  // network: browser.devtools.network
});
