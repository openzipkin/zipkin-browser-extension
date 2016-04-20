import PluginStorage from './PluginStorage';
import {RemoteStorageServer} from './RemoteStorage';

const panel = chrome.devtools.panels.create('Zipkin',
  'zipkin.png',
  'panel.html',
  panel => {
  }
);
