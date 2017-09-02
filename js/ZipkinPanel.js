import React, {Component} from 'react';
import ZipkinUI from './zipkinUI';
import matchUrl from './matchUrl';

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
    const [traceId] = request.headers.filter(h => h.name.toLowerCase() === 'x-b3-traceid');
    if (traceId) {
      this.setState({
        requests: [...this.state.requests, {
          traceId: traceId.value,
          url: request.url
        }]
      });
    }
  }

  traceLink(traceId, requestUrl) {
    const url = matchUrl(requestUrl, this.state.zipkinUrls);
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
