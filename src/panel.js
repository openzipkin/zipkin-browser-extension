import React, {Component, PropTypes} from 'react';
import {render} from 'react-dom';
import minimatch from 'minimatch';
import ZipkinUI from './zipkinUI';

class ZipkinPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      requests: [],
      zipkinUrls: []
    };
  }

  componentDidMount() {
    chrome.devtools.network.onNavigated.addListener(() => {
      this.setState({requests: []});
    });

    chrome.devtools.network.onRequestFinished.addListener(request => {
      // alert(JSON.stringify(request.request));
      const [traceId] = request.request.headers.filter(h => h.name === 'X-B3-TraceId');

      if (traceId) {
        this.setState({
          requests: [...this.state.requests, {
            traceId: traceId.value,
            url: request.request.url
          }]
        });
      }
    });
  }

  matches(url, matcher) {
    console.log('checking for url '+url+' and matcher '+matcher);
    const result = minimatch(url, matcher);
    console.log('was it match?', result);
    return result;
  }

  traceLink(traceId, requestUrl) {
    console.log('matching traceID '+traceId + 'and requestUrl '+requestUrl+' for uis', this.state.zipkinUrls);
    const url = this.state.zipkinUrls.find(url =>
      url.instrumented.find(matcher => this.matches(requestUrl, matcher)) != null
    );
    if (url == null) {
      return null;
    } else {
      return `${url.name}/traces/${encodeURIComponent(traceId)}`;
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
            <ZipkinUI onZipkinUrlsChange={this.handleZipkinUrlsChange.bind(this)} />
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

render(<ZipkinPanel />, document.getElementById('content'));
