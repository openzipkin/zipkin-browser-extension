#!/usr/env/node
const webpack = require('webpack');
const JSZip = require('jszip');
const fs = require('fs');
const webpackConfig = Object.assign(
  {},
  require('./webpack.config.js'), {
    bail: true
  }
);

console.log('Running Webpack...');
webpack(webpackConfig, (err, stats) => {
  if (err) {
    console.log('Webpack error', err.message);
    process.exit(1);
  } else {
    console.log('Webpack run OK');
    console.log('Generating zip...');
    const zip = new JSZip();
    [
      'devtools.html',
      'manifest.json',
      'panel.html',
      'zipkin.png',
      'dist/background.bundle.js',
      'dist/devtools.bundle.js',
      'dist/panel.bundle.js'
    ].forEach(f => zip.file(f, fs.readFileSync(f)));
    fs.writeFileSync('dist/zipkin-chrome-extension.zip', zip.generate({type: 'nodebuffer'}));
    console.log('Zip was generated.');
    // zip.folder('dist');

  }
});
