import React from 'react';
import { render } from 'react-dom';
import ZipkinPanel from './lib/ZipkinPanel';
import PanelToExtensionPubsub from './lib/PanelToExtensionPubsub';
import PluginStorage from './lib/PluginStorage';
import { RemoteStorageServer } from './lib/RemoteStorage';
import addNetworkEvents from './lib/addNetworkEvents';
import { RemoteSetIntervalServer } from './lib/RemoteSetInterval';

const pubsub = new PanelToExtensionPubsub();
addNetworkEvents(browser.devtools.network, pubsub);

const storage = new PluginStorage(browser.storage);
// eslint-disable-next-line no-new
new RemoteStorageServer(pubsub, storage);
// eslint-disable-next-line no-new
new RemoteSetIntervalServer(pubsub, window.setInterval, window.clearInterval);

render(
  <ZipkinPanel pubsub={pubsub} themeName={browser.devtools.panels.themeName} />,
  document.getElementById('content'),
);
