export default function request(url) {
  return new Promise((resolve, reject) => {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
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
