/**
 * Created by jean-marc on 08/06/2018.
 */

const path = require('path');
const babel = require('babel-core');
const BabelPlugin = require('babel-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const HtmlPlugin = require('html-webpack-plugin');
const PwaManifestPlugin = require('webpack-pwa-manifest');
const CopyPlugin = require('copy-webpack-plugin');

const devMode = process.env.NODE_ENV === 'development';

module.exports = [
  {
    mode: devMode ? 'development' : 'production',
    target: 'web',
    entry: ['babel-polyfill','./src/app/index.mjs'],
    output: {
      path: path.resolve('dist'),
      filename: 'bundle.js'
    },
    watch: devMode,
    devServer: {
      contentBase: path.resolve('./dist'),
      port: 8080,
      overlay: true
    },
    devtool: devMode ? 'cheap-eval-source-map' : false,
    resolve: {
      alias: {
        '@app': path.resolve('src/app/')
      }
    },
    module: {
      rules: [
        {
          test: /\.[m]js$/,
          exclude: /(node_modules|serviceworker\.mjs)/,
          use: 'babel-loader'
        }
      ]
    },
    plugins: [
      new UglifyJsPlugin({sourceMap: devMode}),
      new HtmlPlugin({template: 'src/app/index.html'}),
      new CopyPlugin([
        {
          from: 'src/app/serviceworker.mjs',
          to: 'sw.js',
          transform(content, path) {
            return babel.transform(content, {
              presets: [
                ["env", {
                  "targets": {
                    "browsers": ["last 2 Chrome versions"]
                  }
                }]
              ]
            }).code;
          }
        },
        {from: 'src/app/style.css', to: 'style.css'}
      ]),
      new PwaManifestPlugin({
        name: "PWA Todo App",
        short_name: "Todo App",
        theme_color: "#2196f3",
        background_color: "#2196f3",
        display: "fullscreen",
        start_url: "/",
        icons: [
          {
            src: path.resolve('src/app/images/icon-512x512.png'),
            sizes: [96, 128, 192, 256, 384, 512],
            destination: path.join('assets','icons')
          }
        ]
      })
    ]
  },
  /*{
    mode: devMode ? 'development' : 'production',
    target: 'webworker',
    entry: ['./src/app/serviceworker.mjs'],
    output: {
      path: path.resolve('dist'),
      filename: 'sw.js'
    },
    watch: true,
    devtool: devMode ? 'source-map' : false,
    module: {
      rules: [
        {
          test: /serviceworker\.mjs/,
          use: ['babel-loader']
        }
      ]
    }
  }*/
];
