import attachBeforeSendHeadersListeners from './attachBeforeSendHeadersListener';
import checkZipkinUI from './checkZipkinUI';

export default class ZipkinPlugin {
  constructor({pubsub, storage, setInterval, clearInterval, XMLHttpRequest /* network */}) {
    this.pubsub = pubsub;
    this.storage = storage;
    this.setInterval = setInterval;
    this.clearInterval = clearInterval;
    this.XMLHttpRequest = XMLHttpRequest;
    this.zipkinUrls = [];

    this.pubsub.sub('zipkinUrls.load', this.loadFromStorage.bind(this));
    this.pubsub.sub('zipkinUrls.add', this.addZipkinUrl.bind(this));
    this.pubsub.sub('zipkinUrls.remove', this.removeZipkinUrl.bind(this));
  }

  loadFromStorage() {
    this.storage.get('zipkinUrls', []).then(zipkinUrls => {
      zipkinUrls.forEach(zipkinUrl => {
        const exists = this.zipkinUrls.find(z => z.url === zipkinUrl.url);
        if (!exists) {
          this.addZipkinUrl(zipkinUrl.url, false);
        }
      });
    }).then(this.publishZipkinUrlStatus.bind(this));
  }

  publishZipkinUrlStatus() {
    this.pubsub.pub('zipkinUrls.status', this.zipkinUrls);
  }

  setZipkinUIStatus(url, status, instrumented) {
    const zipkinUrl = this.zipkinUrls.find(zipkinUrl => zipkinUrl.url === url);
    if (zipkinUrl) {
      zipkinUrl.status = status;
      zipkinUrl.instrumented = instrumented;
    }
    this.publishZipkinUrlStatus();
  }

  saveZipkinUrls() {
    this.storage.set('zipkinUrls', this.zipkinUrls.map(z => ({url: z.url})));
  }

  async addZipkinUrl(url, saveToStorage = true) {
    // Fetch the endpoint to check if we get redirected
    const fetchUrl = await fetch(url);

    // Never actually download the body
    await fetchUrl.body.cancel();

    if (fetchUrl.redirected && fetchUrl.url === `${url}/zipkin/`) {
      url = `${url}/zipkin`
    }

    this.zipkinUrls.push({
      url,
      statusCheck: this.makeZipkinCheckInterval(url)
    });
    this.publishZipkinUrlStatus();
    if (saveToStorage) {
      this.saveZipkinUrls();
    }
  }

  removeZipkinUrl(url) {
    const zipkinUrl = this.zipkinUrls.find(zipkinUrl => zipkinUrl.url === url);
    if (zipkinUrl) {
      this.clearInterval(zipkinUrl.statusCheck);
      this.zipkinUrls.splice(this.zipkinUrls.indexOf(zipkinUrl), 1);
      this.publishZipkinUrlStatus();
      this.saveZipkinUrls();
    }
  }

  makeZipkinCheckInterval(url) {
    const poll = () => {
      checkZipkinUI(this.XMLHttpRequest, url).then(response => {
        this.setZipkinUIStatus(url, 'up', response.instrumented);
      }).catch(err => {
        this.setZipkinUIStatus(url, err.status ? err.status : 'down', []);
      });
    };
    poll();
    return this.setInterval(poll, 30000);
  }
}
