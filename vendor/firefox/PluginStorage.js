const ss = require('sdk/simple-storage');

export default class PluginStorage {
  constructor() {
    this.listeners = {};
  }

  get(key) {
    return ss.storage[key];
  }

  set(key, value) {
    ss.storage[key] = value;
  }
}
