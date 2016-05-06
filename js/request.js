// We need to inject XMLHttpRequest, because Firefox addons
// don't have it globally available.
export default function request(XMLHttpRequest, url) {
  return new Promise((resolve, reject) => {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    // Used to identity calls originating from within the plugin itself
    xhr.setRequestHeader('X-Zipkin-Extension', '1');
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        resolve(xhr);
      }
    };
    xhr.onerror = function(error) {
      reject(error);
    };
    xhr.send();
  });
}
