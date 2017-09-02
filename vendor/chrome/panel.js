import React from 'react';
import {render} from 'react-dom';
import ZipkinPanel from '../../js/ZipkinPanel';
import PanelToExtensionPubsub from './PanelToExtensionPubsub';
import PluginStorage from './PluginStorage';
import {RemoteStorageServer} from './RemoteStorage';
import addNetworkEvents from '../../js/addNetworkEvents';
import {RemoteSetIntervalServer} from './RemoteSetInterval';

console.log('chrome.devtools.network', chrome.devtools.network);

const pubsub = new PanelToExtensionPubsub();
addNetworkEvents(chrome.devtools.network, pubsub);

const storage = new PluginStorage(chrome.storage);
const storageServer = new RemoteStorageServer(pubsub, storage);
const remoteSetInterval = new RemoteSetIntervalServer(pubsub, window.setInterval, window.clearInterval);

render(<ZipkinPanel pubsub={pubsub} />, document.getElementById('content'));
