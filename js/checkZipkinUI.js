import makeRequest from './request';

export default function checkZipkinUI(XMLHttpRequest, url) {
  const fetchUrl = url + '/config.json';
  return makeRequest(XMLHttpRequest, fetchUrl).then(xhr => {
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
    return {instrumented: data.instrumented || '.*'};
  }).catch(err => {
    return Promise.reject({error: err});
  });
}
