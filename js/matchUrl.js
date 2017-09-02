const matcherCache = {};
function matches(url, matcher) {
  if (!matcherCache[matcher]) {
    matcherCache[matcher] = new RegExp(matcher);
  }
  return matcherCache[matcher].test(url);
}

module.exports = function matchUrl(requestUrl, zipkinUrls) {
  const res = zipkinUrls.find(url => matches(requestUrl, url.instrumented));
  if (!res) {
    return null;
  }
  return res;
};
