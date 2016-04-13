import Random from 'random-js';
import makeRequest from './request';

const random = new Random();
function generateZipkinTraceId() {
  return random.hex(16);
}

const filter = {
  urls: ['*://*/*']
};

chrome.webRequest.onBeforeSendHeaders.addListener(function(details) {
  const traceId = generateZipkinTraceId();
  const zipkinHeaders = {
    'X-Zipkin-Extension': '1',
    // This flag means instrumentation shouldn't throw away this trace
    'X-B3-Sampled': '1',
    // This flag means the collection tier shouldn't throw away this trace
    'X-B3-Flags': '1',
    'X-B3-TraceId': traceId,
    'X-B3-SpanId': traceId
  };

  const modified = {
    requestHeaders: [
      ...(details.requestHeaders || []),
      ...Object.keys(zipkinHeaders).map(key => ({
        name: key,
        value: zipkinHeaders[key]
      }))
    ]
  };
  return modified;
}, filter, ['blocking', 'requestHeaders']);

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type === 'checkZipkinUI') {
    const fetchUrl = request.zipkinUrl + '/config.json';
    makeRequest(fetchUrl).then(xhr => {
      if (xhr.status !== 200) {
        return Promise.reject({status: 'error ' + xhr.status});
      } else {
        const contentType = xhr.getResponseHeader('content-type');
        if (contentType.indexOf('application/json') === -1) {
          return Promise.reject({status: 'invalid response type ' + contentType});
        } else {
          try {
            return JSON.parse(xhr.responseText);
          } catch (parseError) {
            return Promise.reject({status: 'invalid response (JSON parse error)'});
          }
        }
      }
    }).then(data => {
      const r = {instrumented: data.instrumented || ['**']};
      sendResponse(r);
    }).catch(err => {
      const r = {error: err};
      sendResponse(r);
    });
    return true;
  } else {
    sendResponse({error: `Invalid message type "${request.type}"`});
  }
});
