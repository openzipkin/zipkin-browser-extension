export default async function checkZipkinUI(url) {
  const fetchUrl = url + '/config.json';

  // Used to identity calls originating from within the plugin itself
  const res = await fetch(fetchUrl, { headers: { 'X-Zipkin-Extension': '1' } });

  if (!res.ok) {
    throw new Error(`Invalid status: ${res.status}.`);
  }

  const data = await res.json();

  return data.instrumented || '.*';
}
