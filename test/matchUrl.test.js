import matchUrl from '../js/matchUrl';

describe('urlMatcher', () => {
  it('should return null when no match is found', () => {
    expect(matchUrl('http://example.com/', [])).toBeNull();
  });

  it('should match a zipkin url', () => {
    const match = matchUrl('http://example.com/', [{
      instrumented: 'notmatch',
      url: 'http://zipkin-nomatch.example.com'
    },{
      instrumented: '.*',
      url: 'http://zipkin.example.com'
    }]);
    expect(match.url).toEqual('http://zipkin.example.com');
  });

  it('should return the first matching zipkin url', () => {
    const match = matchUrl('http://example.com/', [{
      instrumented: 'notmatch',
      url: 'http://zipkin1.example.com'
    }, {
      instrumented: '.*',
      url: 'http://zipkin2.example.com'
    }, {
      instrumented: '.*',
      url: 'http://zipkin3.example.com'
    }]);
    expect(match.url).toEqual('http://zipkin2.example.com');
  });
});
