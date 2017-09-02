export class RemoteStorageClient {
  constructor(pubsub) {
    this.pubsub = pubsub;
  }

  get(key, defaultValue = undefined) {
    return new Promise(resolve =>
      this.pubsub.query('remoteStorage.get', { key, defaultValue }, resolve),
    );
  }

  set(key, value) {
    return new Promise(resolve =>
      this.pubsub.query('remoteStorage.set', { key, value }, resolve),
    );
  }

  onChange(key, listener) {
    this.pubsub.sub('remoteStorage.onchange', key, listener);
  }
}

export class RemoteStorageServer {
  constructor(pubsub, storage) {
    pubsub.serve('remoteStorage.get', ({ key, defaultValue }, callback) =>
      storage.get(key, defaultValue).then(callback),
    );
    pubsub.serve('remoteStorage.set', ({ key, value }, callback) =>
      storage.set(key, value).then(callback),
    );
    pubsub.serve('remoteStorage.onchange', (key, resolve) =>
      storage.onChange(key, resolve),
    );
  }
}
