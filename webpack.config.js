var path = require('path');

module.exports = {
  entry: {
    background: path.join(__dirname, 'src/background.js'),
    devtools: path.join(__dirname, 'src/devtools.js'),
    panel: path.join(__dirname, 'src/panel.js')
  },
  context: __dirname,
  resolve: {
    modulesDirectories: ['node_modules']
  },
  output: {
    path: 'dist',
    filename: '[name].bundle.js'
  },
  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'babel',
      exclude: ['node_modules']
    }]
  }
};
