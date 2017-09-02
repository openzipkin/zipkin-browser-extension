import React, { Component } from 'react';
import PropTypes from 'prop-types';
import url from 'url';

const protocolRegexp = /https?:\/\//;

export default class ZipkinUI extends Component {
  static propTypes = {
    pubsub: PropTypes.shape({
      pub: PropTypes.func().isRequired,
      sub: PropTypes.func().isRequired,
    }).isRequired,
    darkTheme: PropTypes.bool(),
  };

  static defaultProps = {
    darkTheme: false,
  };

  constructor(props) {
    super(props);
    this.state = {
      zipkinUrl: '',
      zipkinUrls: [],
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleUrlChange = this.handleUrlChange.bind(this);
    this.handleZipkinStatuses = this.handleZipkinStatuses.bind(this);
  }

  componentDidMount() {
    this.props.pubsub.pub('zipkinUrls.load');
    this.props.pubsub.sub('zipkinUrls.status', this.handleZipkinStatuses);
  }

  handleZipkinStatuses(statuses) {
    this.setState({
      zipkinUrls: statuses,
    });
  }

  handleSubmit(ev) {
    ev.preventDefault();
    const { zipkinUrl } = this.state;
    this.setState({
      zipkinUrl: '',
    });

    try {
      if (!protocolRegexp.test(zipkinUrl)) {
        alert('The URL must start with http:// or https://');
      } else {
        const parsed = url.parse(zipkinUrl);
        const rebuilt = url.format({
          ...parsed,
          pathname: '',
          query: '',
        });

        this.props.pubsub.pub('zipkinUrls.add', rebuilt);
      }
    } catch (err) {
      alert(`Couldn't parse url: ${err}`);
    }
  }

  handleUrlChange(ev) {
    this.setState({
      zipkinUrl: ev.target.value,
    });
  }

  handleRemoveUrl(removedUrl) {
    this.props.pubsub.pub('zipkinUrls.remove', removedUrl);
  }

  render() {
    const hasZipkinUrls = this.state.zipkinUrls.length > 0;
    const alignLeft = { textAlign: 'left', verticalAlign: 'top' };
    const green = this.props.darkTheme ? '#00e600' : '#009900';
    const red = this.props.darkTheme ? '#e60000' : '#990000';

    return (
      <div style={{ width: '400px' }}>
        <div>
          <form id="zipkin-add-ui" onSubmit={this.handleSubmit}>
            <input
              id="zipkin-url"
              type="text"
              value={this.state.zipkinUrl}
              onChange={this.handleUrlChange}
              name="zipkin-url"
              style={{ width: '300px' }}
              placeholder="Enter URL to a Zipkin UI"
            />
            <input type="submit" value="Add" />
          </form>
        </div>
        {hasZipkinUrls ? (
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
              {this.state.zipkinUrls.map(zipkinUrl => {
                const status =
                  zipkinUrl.status === 'up'
                    ? '✓'
                    : zipkinUrl.status || 'unknown status';
                const color = zipkinUrl.status === 'up' ? green : red;
                return (
                  <tr key={zipkinUrl.url}>
                    <td style={{ ...alignLeft, color }}>{zipkinUrl.url}</td>
                    <td style={alignLeft}>{status}</td>
                    <td style={alignLeft}>{zipkinUrl.instrumented}</td>
                    <td style={alignLeft}>
                      <button
                        onClick={() => this.handleRemoveUrl(zipkinUrl.url)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div>
            You need to add the URL to a Zipkin UI in order to view traces.
          </div>
        )}
      </div>
    );
  }
}
