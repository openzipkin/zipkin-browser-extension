export default class PluginStorage {
  constructor(chromeStorage) {
    this.chromeStorage = chromeStorage;
    this.listeners = {};
    this.chromeStorage.onChanged.addListener((changes, namespace) => {
      for (let key in changes) {
        if (this.listeners[key]) {
          this.listeners[key].forEach(listener => listener(changes[key].newValue));
        }
      }
    });
  }

  get(key, defaultValue = undefined) {
    return new Promise((resolve, reject) => {
        console.log('chrome sync getting', key);
        return this.chromeStorage.sync.get(key, data => {
          console.log('chrome sync got', data);
          return resolve(data[key] !== undefined ? data[key] : defaultValue);
        });
      }
    );
  }

  set(key, value) {
    console.log('chrome sync ZETting', value);
    const data = {};
    data[key] = value;
    return new Promise((resolve, reject) =>
      this.chromeStorage.sync.set(data, resolve)
    );
  }

  onChange(key, listener) {
    this.listeners[key] = this.listeners[key] || {};
    this.listeners[key].push(listener);
  }
}
