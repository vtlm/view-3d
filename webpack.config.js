const webpack = require('webpack')

module.exports = {
//  entry: ['react-hot-loader/patch', './src/index.js'],
  entry: ['./src/index.js'],
  module: {
    rules: [
      // {
      //    test: /\.worker\.js$/,
      //    exclude: /node_modules/,
      //    use: { loader: 'worker-loader' }
      //  },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      },
      {
        test: /\.css$/,
        use: [ "style-loader" ,'css-loader' ]
      }

    ]
  },
  resolve: {
    extensions: ['*', '.js', '.jsx']
  },
  output: {
    path: __dirname + '/dist',
    publicPath: '/',
    filename: 'bundle.js',
    // globalObject:'self'
  },
  // plugins: [new webpack.HotModuleReplacementPlugin()],
  devServer: {
    contentBase: './dist',
    port: 8080,
    // hot: true
  }
}
