// This is a simple server that returns a JSON of all the
// request headers that were sent. (Useful for seeing the
// effects of the chrome extension)
const express = require('express');

const app = express();
const port = 8080;

app.set('json spaces', 2);

app.get('/config.json', (req, res) => {
  res.json({
    instrumented: '\\/\\/example\\.com\\/'
  });
});
app.get('*', (req, res) => {
  console.log('req', req.headers);
  res.header('Access-Control-Allow-Origin', '*');
  res.header("Access-Control-Allow-Headers", "Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST");
  console.log('res', res.headers);
  res.json(req.headers);
});
app.listen(port, () => {
  console.log(`zipkin-chrome-extension test server running on port ${port}`);
});
