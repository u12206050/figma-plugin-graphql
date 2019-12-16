const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');

const isMain = process.env.TARGET_NODE === 'main';

if (isMain) {
  webpack(
    {
      stats: 'minimal',
      mode: 'production',
      devtool: false,
      entry: {
        main: './src/main/index.ts'
      },
      module: {
        rules: [{ test: /\.ts?$/, use: 'ts-loader', exclude: /node_modules/ }]
      },
      resolve: { extensions: ['.tsx', '.ts', '.jsx', '.js'] },
      output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist')
      }
    },
    () => {
      console.log('main created');
    }
  );
} else {
  const config = {
    css: {
      extract: false
    },
    configureWebpack: {
      stats: 'minimal',
      devtool: false,
      optimization: {
        splitChunks: false
      },
      entry: {
        app: './src/ui/main.ts'
      },
      resolve: {
        alias: {
          '@': __dirname + '/src/ui'
        }
      },
      output: {
        filename: '[name].js',
        chunkFilename: '[name].js'
      },
      devServer: {
        host: '127.0.0.1',
        port: 8080,
        compress: true,
        disableHostCheck: true,
        writeToDisk: true,
        historyApiFallback: true
      },
      plugins: [
        new HtmlWebpackPlugin({
          template: 'public/index.html',
          inlineSource: '.(js|css)$',
          chunks: ['app']
        }),
        new HtmlWebpackInlineSourcePlugin(HtmlWebpackPlugin)
      ]
    }
  };

  module.exports = config;
}
