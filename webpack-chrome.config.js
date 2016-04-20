const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: {
    background: path.join(__dirname, 'vendor/chrome/background.js'),
    devtools: path.join(__dirname, 'vendor/chrome/devtools.js'),
    panel: path.join(__dirname, 'vendor/chrome/panel.js')
  },
  target: 'web',
  context: __dirname,
  resolve: {
    modulesDirectories: ['node_modules']
  },
  output: {
    // path: __dirname + '/build/chrome',
    filename: '[name].bundle.js'
  },
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
