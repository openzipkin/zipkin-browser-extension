import React, {Component, PropTypes} from 'react';
import url from 'url';

const urlChecks = {};

function makeZipkinCheckInterval(component, url) {
  const poll = () => {
    chrome.runtime.sendMessage({
      type: 'checkZipkinUI',
      zipkinUrl: url.name
    }, response => {
      if (response.error) {
        component.setZipkinUIStatus(url, response.error.status ? response.error.status : 'down', []);
      } else {
        component.setZipkinUIStatus(url, 'up', response.instrumented);
      }
    });
  };
  poll();
  return setInterval(poll, 30000);
}

export default class ZipkinUI extends Component {
  constructor(props) {
    super(props);
    this.state = {
      zipkinUrl: '',
      zipkinUrls: []
    };
  }

  componentDidMount() {
    this.loadSavedSettings();
    chrome.storage.onChanged.addListener((changes, namespace) => {
      for (let key in changes) {
        if (key !== 'zipkinUrls') continue;
        const storageChange = changes[key];
        const newValue = storageChange.newValue;
        this.setState({
          zipkinUrls: newValue
        });
      }
    });
  }

  loadSavedSettings() {
    //alert('now loading saved settings');
    //alert('sync get its a ' + (typeof chrome.storage.sync.get));
    chrome.storage.sync.get('zipkinUrls', data => {
      this.updateZipkinUrls(data.zipkinUrls || []);
    });
  }

  updateSyncState(urls, callback) {
    const newState = {
      zipkinUrls: urls
    };
    // alert('update sync state ' + JSON.stringify(newState));
    chrome.storage.sync.set(newState, () => {
      this.loadSavedSettings();
      callback();
    });
  }

  updateZipkinUrls(zipkinUrls) {
    this.setState({zipkinUrls});
    zipkinUrls.forEach(url => {
      if (!urlChecks[url.name]) {
        urlChecks[url.name] = makeZipkinCheckInterval(this, url);
      }
    });
    if (this.props.onZipkinUrlsChange) {
      this.props.onZipkinUrlsChange(zipkinUrls);
    }
  }

  setZipkinUIStatus(url, status, instrumented) {
    this.updateZipkinUrls(this.state.zipkinUrls.map(zipkinUrl => ({
      ...zipkinUrl,
      status: url.name === zipkinUrl.name ? status : zipkinUrl.status,
      instrumented: url.name === zipkinUrl.name ? instrumented || [] : zipkinUrl.instrumented
    })));
  }

  addZipkinUrl(url) {
    this.updateSyncState([...this.state.zipkinUrls, url], () => {
      this.setZipkinUIStatus(url, 'inprogress', []);
    });
  }

  handleSubmit(ev) {
    ev.preventDefault();
    const {zipkinUrl} = this.state;
    this.setState({
      zipkinUrl: ''
    });

    let newUrl;
    try {
      if (/https?\:\/\//.exec(zipkinUrl) == null) {
        alert('The URL must start with http:// or https://');
      } else {
        const parsed = url.parse(zipkinUrl);
        const rebuilt = url.format({
          ...parsed,
          pathname: '',
          query: ''
        });
        newUrl = {name: rebuilt};
        if (this.state.zipkinUrls.find(url => url.name === rebuilt)) {
          alert(`The Zipkin UI "${rebuilt}" is already registered.`);
        } else {
          this.addZipkinUrl(newUrl);
        }
      }
    } catch(err) {
      alert('Couldn\'t parse url: ' + err);
      newUrl = {name: '[invalid]'};
    }
  }

  handleUrlChange(ev) {
    this.setState({
      zipkinUrl: ev.target.value
    });
  }

  handleRemoveUrl(name) {
    this.updateSyncState(this.state.zipkinUrls.filter(url => url.name !== name));
    if (urlChecks[name]) {
      clearInterval(urlChecks[name]);
      delete urlChecks[name];
    }
  }

  render() {
    const hasZipkinUrls = this.state.zipkinUrls.length > 0;
    const alignLeft = {textAlign: 'left', verticalAlign: 'top'};
    return (
      <div style={{width: '400px'}}>
        <div>
          <form id="zipkin-add-ui" onSubmit={this.handleSubmit.bind(this)}>
            <input id="zipkin-url"
                   type="text"
                   value={this.state.zipkinUrl}
                   onChange={this.handleUrlChange.bind(this)}
                   name="zipkin-url"
                   style={{width: '300px'}}
                   placeholder="Enter URL to a Zipkin UI" />
            <input type="submit" value="Add" />
          </form>
        </div>
        {hasZipkinUrls ?
        <table>
          <thead>
            <tr>
              <th style={alignLeft}>URL</th>
              <th style={alignLeft}>Status</th>
              <th style={alignLeft}>Instrumented sites</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
          {this.state.zipkinUrls.map(url => {
            const status = url.status === 'up' ? "✓" : (url.status || 'unknown status');
            const color = url.status === 'up' ? '#009900' : '#990000';
            return (
              <tr key={url.name}>
                <td style={{...alignLeft, color}}>{url.name}</td>
                <td style={alignLeft}>{status}</td>
                <td style={alignLeft}>{(url.instrumented || []).join(', ')}</td>
                <td style={alignLeft}><button onClick={() => this.handleRemoveUrl(url.name)}>Remove</button></td>
              </tr>
            )
          })}
          </tbody>
        </table>
        : <div>You need to add the URL to a Zipkin UI in order to view traces.</div>}
      </div>
    );
  }
}
