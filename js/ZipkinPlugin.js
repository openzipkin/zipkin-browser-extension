import checkZipkinUI from './checkZipkinUI';

export default class ZipkinPlugin {
  constructor({ pubsub, storage, setInterval, clearInterval /* network */ }) {
    this.pubsub = pubsub;
    this.storage = storage;
    this.setInterval = setInterval;
    this.clearInterval = clearInterval;
    this.zipkinUrls = [];

    this.pubsub.sub('zipkinUrls.load', this.loadFromStorage.bind(this));
    this.pubsub.sub('zipkinUrls.add', this.addZipkinUrl.bind(this));
    this.pubsub.sub('zipkinUrls.remove', this.removeZipkinUrl.bind(this));
  }

  async loadFromStorage() {
    const zipkinUrls = await this.storage.get('zipkinUrls', []);

    await Promise.all(zipkinUrls.map(zipkinUrl => {
      const exists = this.zipkinUrls.find(z => z.url === zipkinUrl.url);
      if (!exists) {
        return this.addZipkinUrl(zipkinUrl.url, false);
      }
    })
      .filter(Boolean));

    this.publishZipkinUrlStatus();
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
    return this.storage.set('zipkinUrls', this.zipkinUrls.map(z => ({ url: z.url })));
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
    const poll = async () => {
      try {
        const instrumented = await checkZipkinUI(url);

        this.setZipkinUIStatus(url, 'up', instrumented);
      } catch (err) {
        this.setZipkinUIStatus(url, err.message || 'down', []);
      }
    };
    poll();
    return this.setInterval(poll, 30000);
  }
}
