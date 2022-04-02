const fs = require('fs')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const { merge } = require('webpack-merge')
const webpack = require('webpack')

const base = require('./webpack.config.js')
const paths = require('./paths')

const title = 'New GH pages'
const subPath ='if-script'
const version = '0.2.1'

module.exports = merge(base, {
  mode: 'production',
  devtool: false,
  output: {
    path: paths.build,
    publicPath: '/',
    filename: 'scripts/[name].[contenthash].bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.(scss|css)$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      }
    ]
  },
  plugins: [
    // Extracts CSS into separate files
    new MiniCssExtractPlugin({
      filename: 'styles/[name].[contenthash].css',
      chunkFilename: 'styles/[id].css'
    }),
    new webpack.BannerPlugin({
      banner: `
      ${title} ${version}
      ==============

      Built: ${new Date().toDateString()}

      Copyright (c) ${new Date().getUTCFullYear()} ${title} Contributors
      Author(s): Mihir Jichkar

      MIT Licensed
      https://github.com/PlytonRexus/${subPath}.git\n
     `
    }),
    new CleanWebpackPlugin()
  ],
  optimization: {
    minimize: true,
    minimizer: [new CssMinimizerPlugin(), '...'],
    runtimeChunk: {
      name: 'runtime'
    }
  },
  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000
  }
})
