import React, {Component} from 'react';
import minimatch from 'minimatch';
import ZipkinUI from './ZipkinUI';

export default class ZipkinPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      requests: [],
      zipkinUrls: []
    };
  }

  componentDidMount() {
    this.props.pubsub.sub('zipkinUrls.status', this.handleZipkinUrlsChange.bind(this));
    this.props.pubsub.sub('navigated', () => this.setState({requests: []}));
    this.props.pubsub.sub('requestFinished', this.handleRequestFinished.bind(this));
  }


  handleRequestFinished(request) {
    const [traceId] = request.headers.filter(h => h.name === 'X-B3-TraceId');
    if (traceId) {
      this.setState({
        requests: [...this.state.requests, {
          traceId: traceId.value,
          url: request.url
        }]
      });
    }
  }

  matches(url, matcher) {
    if (!this.matcherCache) {
      this.matcherCache = {};
    }
    if (!this.matcherCache[matcher]) {
      this.matcherCache[matcher] = new RegExp(matcher);
    }
    return this.matcherCache[matcher].test(url);
  }

  traceLink(traceId, requestUrl) {
    const url = this.state.zipkinUrls.find(url =>
      this.matches(requestUrl, url.instrumented)
    );
    if (url == null) {
      return null;
    } else {
      return `${url.url}/traces/${encodeURIComponent(traceId)}`;
    }
  }

  handleZipkinUrlsChange(value) {
    this.setState({
      zipkinUrls: value
    });
  }

  render() {
    const alignLeft = {textAlign: 'left', verticalAlign: 'top'};
    return (
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <h2>Zipkin traces</h2>
            <ZipkinUI pubsub={this.props.pubsub} />
            <table>
              <thead>
              <tr>
                <th style={alignLeft}>Trace</th>
                <th style={alignLeft}>Request</th>
              </tr>
              </thead>
              <tbody>
              {this.state.requests.length > 0 ? this.state.requests.map(request => (
                  <tr key={request.traceId}>
                    <td style={alignLeft}><a target="blank" href={this.traceLink(request.traceId, request.url)}>{request.traceId}</a></td>
                    <td style={alignLeft}>{request.url}</td>
                  </tr>
                )
              ) :
                <tr><td colSpan="2">Recording network activity... Perform a request or hit F5 to record the reload.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
}
