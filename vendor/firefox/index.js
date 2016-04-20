const self = require("sdk/self");
const {Class} = require('sdk/core/heritage');
const {Panel} = require('dev/panel');
const {Tool} = require('dev/toolbox');
import AddonToPanelPubsub from './AddonToPanelPubsub';
import PluginStorage from './PluginStorage';
import ZipkinPlugin from '../../js/ZipkinPlugin';
import attachBeforeSendHeadersListener from './attachBeforeSendHeadersListener';
// import addNetworkEvents from './addNetworkEvents';

const {CC, Cc, Ci, Cu} = require('chrome');
const {setInterval} = require('sdk/timers');

const XMLHttpRequest = CC("@mozilla.org/xmlextras/xmlhttprequest;1");

const ZipkinPanel = Class({
  extends: Panel,
  label: 'Zipkin',
  tooltip: 'Zipkin trace debugging',
  icon: self.data.url('icon64.png'),
  url: self.data.url('zipkin-panel.html'),
  onReady: function() {
    const storage = new PluginStorage();
    const pubsub = new AddonToPanelPubsub(this);
    // addNetworkEvents({pubsub});
    attachBeforeSendHeadersListener({
      Cc,
      Ci,
      Cu,
      pubsub
    });
    // setInterval(() => pubsub.pub('ping from addon', {}), 1000);
    new ZipkinPlugin({pubsub, storage, setInterval, XMLHttpRequest});
  }
});

const zipkinTool = new Tool({
  panels: { zipkin: ZipkinPanel }
});
