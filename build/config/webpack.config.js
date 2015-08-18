'use strict';

var path = require('path'),
    webpack = require('webpack'),
    pkg = require('./../../package.json');

var debug = process.argv.indexOf('--debug') > 0;

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
            exclude: /asmcrypto/,
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
            compress: false
        }),
        new webpack.BannerPlugin('kdbxweb v' + pkg.version + ', (c) 2015 ' + pkg.author +
            ', opensource.org/licenses/' + pkg.license)
    ],
    node: {
        console: false,
        process: false,
        Buffer: false,
        __filename: false,
        __dirname: false
    },
    'uglify-loader': {
        mangle: {},
        compress: {}
    }
};
