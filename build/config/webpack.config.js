'use strict';

var path = require('path'),
    webpack = require('webpack'),
    pkg = require('./../../package.json');

var debug = process.argv.indexOf('--mode=development') > 0;

var StatsPlugin = require('stats-webpack-plugin');
var TerserPlugin = require('terser-webpack-plugin');

const banner =
    'kdbxweb v' +
    pkg.version +
    ', (c) ' +
    new Date().getFullYear() +
    ' ' +
    pkg.author +
    ', opensource.org/licenses/' +
    pkg.license;

module.exports = {
    // mode: 'production',
    context: path.join(__dirname, '../../lib'),
    entry: './index.js',
    output: {
        path: path.join(__dirname, '../../dist'),
        filename: 'kdbxweb' + (debug ? '' : '.min') + '.js',
        library: 'kdbxweb',
        libraryTarget: 'umd',
        globalObject: 'this'
    },
    module: {},
    resolve: {
        modules: [path.join(__dirname, '../../lib'), path.join(__dirname, '../../node_modules')],
        fallback: {
            console: false,
            process: false,
            Buffer: false,
            crypto: false,
            zlib: false
        }
    },
    plugins: [
        new webpack.BannerPlugin({
            banner: banner
        }),
        new StatsPlugin('stats.json', { chunkModules: true })
    ],
    node: {
        __filename: false,
        __dirname: false
    },
    optimization: {
        minimize: !debug,
        minimizer: debug
            ? []
            : [
                  new TerserPlugin({
                      extractComments: false
                  })
              ]
    },
    externals: {
        fs: true,
        path: true,
        xmldom: true,
        crypto: true,
        zlib: true
    },
    performance: {
        hints: false
    }
};
