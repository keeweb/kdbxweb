'use strict';

var path = require('path'),
    webpack = require('webpack'),
    pkg = require('./../../package.json');

var debug = process.argv.indexOf('--debug') > 0;

var StatsPlugin = require('stats-webpack-plugin');

module.exports = {
    context: path.join(__dirname, '../../lib'),
    entry: './index.js',
    output: {
        path: path.join(__dirname, '../../dist'),
        filename: 'kdbxweb.js',
        library: 'kdbxweb',
        libraryTarget: 'umd'
    },
    module: {
        loaders: debug ? null : [{
            test: /\.js$/,
            loader: 'uglify'
        }]
    },
    resolve: {
        root: [path.join(__dirname, '../../lib')]
    },
    resolveLoader: {
        root: [path.join(__dirname, '../../node_modules')]
    },
    plugins: debug ? null : [
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.optimize.UglifyJsPlugin({
            mangle: { keep_fnames: true },
            compress: false,
            output: { ascii_only: true }
        }),
        new webpack.BannerPlugin('kdbxweb v' + pkg.version + ', (c) ' + new Date().getFullYear() + ' ' + pkg.author +
            ', opensource.org/licenses/' + pkg.license),
        new StatsPlugin('stats.json', { chunkModules: true })
    ],
    node: {
        console: false,
        process: false,
        Buffer: false,
        __filename: false,
        __dirname: false,
        crypto: false,
        zlib: false
    },
    'uglify-loader': {
        mangle: {},
        compress: {},
        output: { ascii_only: true }
    },
    externals: {
        fs: true,
        path: true,
        xmldom: true,
        crypto: true,
        zlib: true
    }
};
