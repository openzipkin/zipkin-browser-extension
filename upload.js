// USAGE:
// node upload.js upload
// node upload.js publish

const fs = require('fs');
const GoogleAuth = require('google-auth-library');
const fetch = require('node-fetch');

const command = process.argv[2];

const appId = 'jdpmaacocdhbmkppghmgnjmfikeeldfe';

const clientId = '1077732158179-kdth2msv27g08oair1pvo3apu3ievrsm.apps.googleusercontent.com';
const clientSecret = fs.readFileSync('client-secret.txt', 'utf-8').trim();
const refreshToken = fs.readFileSync('refresh-token.txt', 'utf-8').trim();

const auth = new GoogleAuth();
const OAuth2 = auth.OAuth2;
const oauth2Client = new OAuth2(clientId, clientSecret, 'urn:ietf:wg:oauth:2.0:oob');
const webstoreScope = 'https://www.googleapis.com/auth/chromewebstore';
const scopes = [webstoreScope];
oauth2Client.setCredentials({
  refresh_token: refreshToken
});
oauth2Client.refreshAccessToken((err, tokens) => {
  if (err) {
    console.error('oh no!');
    console.error(err);
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes
    });
    console.error('get a new token here', url);
  } else {
    if (command === 'upload') {
      const data = fs.createReadStream('dist/chrome/zipkin-chrome-extension.zip');
      // https://developer.chrome.com/webstore/using_webstore_api#uploadexisitng
      fetch('https://www.googleapis.com/upload/chromewebstore/v1.1/items/' + appId, {
        method: 'PUT',
        body: data,
        headers: {
          'Authorization': 'Bearer ' + tokens.access_token,
          'x-goog-api-version': '2'
        }
      })
        .then(res => res.text())
        .then(console.log)
        .catch(console.error);
    } else if (command === 'publish') {
      fetch('https://www.googleapis.com/chromewebstore/v1.1/items/' + appId + '/publish', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + tokens.access_token,
          'x-goog-api-version': '2'
        }
      }).then(res => res.text())
        .then(console.log)
        .catch(console.error);
    } else {
      console.log(`Invalid command "${command}".`);
    }
  }
});
