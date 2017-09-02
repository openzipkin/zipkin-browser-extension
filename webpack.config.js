const path = require('path');
const webpack = require('webpack');
const ChromeDevPlugin = require('chrome-dev-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ZipPlugin = require('zip-webpack-plugin');

module.exports = {
  entry: {
    background: './src/background.js',
    devtools: './src/devtools.js',
    panel: './src/panel.js',
  },
  output: {
    filename: '[name].bundle.js',
    path: path.join(__dirname, 'build'),
  },
  context: __dirname,
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: ['node_modules'],
      },
    ],
  },
  plugins: [
    new ChromeDevPlugin(),
    new CopyWebpackPlugin([
      { context: path.join(__dirname, 'src/html'), from: '*' },
      { context: path.join(__dirname, 'src/img'), from: '*' },
      { from: require.resolve('webextension-polyfill') },
    ]),
    new ZipPlugin({
      path: path.join(__dirname, 'dist'),
      filename: 'zipkin-extension.zip',
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"dev"',
      },
    }),
  ],
};
