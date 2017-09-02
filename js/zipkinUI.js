import React, {Component} from 'react';
import url from 'url';

export default class ZipkinUI extends Component {
  constructor(props) {
    super(props);
    this.state = {
      zipkinUrl: '',
      zipkinUrls: []
    };
  }

  componentDidMount() {
    this.props.pubsub.pub('zipkinUrls.load');
    this.props.pubsub.sub('zipkinUrls.status', this.handleZipkinStatuses.bind(this));
  }

  handleZipkinStatuses(statuses) {
    this.setState({
      zipkinUrls: statuses
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

        this.props.pubsub.pub('zipkinUrls.add', rebuilt);
      }
    } catch(err) {
      alert('Couldn\'t parse url: ' + err);
    }
  }

  handleUrlChange(ev) {
    this.setState({
      zipkinUrl: ev.target.value
    });
  }

  handleRemoveUrl(url) {
    this.props.pubsub.pub('zipkinUrls.remove', url);
  }

  render() {
    const hasZipkinUrls = this.state.zipkinUrls.length > 0;
    const alignLeft = {textAlign: 'left', verticalAlign: 'top'};
    const green = this.props.darkTheme ? '#00e600' : '#009900';
    const red = this.props.darkTheme ? '#e60000' : '#990000';

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
              <th />
            </tr>
          </thead>
          <tbody>
          {this.state.zipkinUrls.map(url => {
            const status = url.status === 'up' ? "✓" : (url.status || 'unknown status');
            const color = url.status === 'up' ? green : red;
            return (
              <tr key={url.url}>
                <td style={{...alignLeft, color}}>{url.url}</td>
                <td style={alignLeft}>{status}</td>
                <td style={alignLeft}>{url.instrumented}</td>
                <td style={alignLeft}><button onClick={() => this.handleRemoveUrl(url.url)}>Remove</button></td>
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
