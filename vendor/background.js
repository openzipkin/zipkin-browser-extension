import ExtensionToPanelPubsub from './ExtensionToPanelPubsub';
import {RemoteStorageClient} from './RemoteStorage';
import {RemoteSetIntervalClient} from './RemoteSetInterval';
import ZipkinPlugin from '../js/ZipkinPlugin';

import attachBeforeSendHeadersListener from '../js/attachBeforeSendHeadersListener';

attachBeforeSendHeadersListener(chrome.webRequest);

const pubsub = new ExtensionToPanelPubsub(chrome.runtime);
const storage = new RemoteStorageClient(pubsub);
const remoteSetInterval = new RemoteSetIntervalClient(pubsub);
const plugin = new ZipkinPlugin({
  pubsub,
  storage,
  setInterval: remoteSetInterval.setInterval,
  clearInterval: remoteSetInterval.clearInterval,
  XMLHttpRequest
  // network: chrome.devtools.network
});
