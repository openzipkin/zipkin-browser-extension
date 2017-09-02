export default class PluginStorage {
  constructor(browserStorage) {
    this.browserStorage = browserStorage;
    this.listeners = {};
    this.browserStorage.onChanged.addListener((changes, namespace) => {
      for (let key in changes) {
        if (this.listeners[key]) {
          this.listeners[key].forEach(listener => listener(changes[key].newValue));
        }
      }
    });
  }

  async get(key, defaultValue = undefined) {
    console.log('sync getting', key);

    const data = await this.browserStorage.sync.get(key);
    console.log('sync got', data);

    return data[key] !== undefined ? data[key] : defaultValue;
  }

  set(key, value) {
    console.log('sync ZETting', value);
    const data = {};
    data[key] = value;

    return this.browserStorage.sync.set(data);
  }

  onChange(key, listener) {
    this.listeners[key] = this.listeners[key] || {};
    this.listeners[key].push(listener);
  }
}
