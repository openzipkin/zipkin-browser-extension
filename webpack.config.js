const path = require('path');
const webpack = require('webpack');
const ChromeDevPlugin = require('chrome-dev-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ZipPlugin = require('zip-webpack-plugin');

module.exports = {
  entry: {
    background: require.resolve('./vendor/background.js'),
    devtools: require.resolve('./vendor/devtools.js'),
    panel: require.resolve('./vendor/panel.js')
  },
  output: {
    filename: '[name].bundle.js',
    path: path.join(__dirname, 'build'),
  },
  context: __dirname,
  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'babel-loader',
      exclude: ['node_modules']
    }]
  },
  plugins: [
    new ChromeDevPlugin(),
    new CopyWebpackPlugin([{ context: path.join(__dirname, 'vendor'), from: '*.html' }]),
    new ZipPlugin({
      path: path.join(__dirname, 'dist'),
      filename: 'zipkin-extension.zip',
    }),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': '"dev"'
      }
    }),
  ],
};
