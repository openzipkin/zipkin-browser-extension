import React from 'react';
import { render } from 'react-dom';
import ZipkinPanel from '../js/ZipkinPanel';
import PanelToExtensionPubsub from './PanelToExtensionPubsub';
import PluginStorage from './PluginStorage';
import { RemoteStorageServer } from './RemoteStorage';
import addNetworkEvents from '../js/addNetworkEvents';
import { RemoteSetIntervalServer } from './RemoteSetInterval';

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
