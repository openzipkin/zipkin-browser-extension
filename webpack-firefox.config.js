const path = require('path');
const webpack = require('webpack');

// Bindings to Firefox' addon API. Resolved by
// the browser runtime.
// Firefox plugins should require('sdk/...'), and
// webpack should not resolve the imports (they
// don't exist in node_modules).
const firefoxAddonExternals = {};
[
  'chrome',
  'dev/toolbox',
  'dev/panel',
  'sdk/core/heritage',
  'sdk/self',
  'sdk/messaging',
  'sdk/simple-storage',
  'sdk/timers',
  'sdk/tabs'
].forEach(library => {
  firefoxAddonExternals[library] = `commonjs ${library}`
});

module.exports = {
  entry: {
    index: path.join(__dirname, 'vendor/firefox/index.js'),
    'data/panel': path.join(__dirname, 'vendor/firefox/panel.js'),
  },
  target: 'web',
  context: __dirname,
  resolve: {
    modulesDirectories: ['node_modules']
  },
  output: {
    filename: '[name].bundle.js'
  },
  externals: firefoxAddonExternals,
  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'babel',
      exclude: ['node_modules']
    }]
  },

  plugins: [new webpack.DefinePlugin({
    'process.env': {
      'NODE_ENV': '"dev"'
    }
  })]
};
