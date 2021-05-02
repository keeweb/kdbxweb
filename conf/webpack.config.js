const path = require('path'),
    webpack = require('webpack'),
    pkg = require('../package.json');

const debug = process.argv.indexOf('--mode=development') > 0;

const StatsPlugin = require('stats-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

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
    context: path.join(__dirname, '../lib'),
    entry: './index.ts',
    output: {
        path: path.join(__dirname, '../dist'),
        filename: 'kdbxweb' + (debug ? '' : '.min') + '.js',
        library: 'kdbxweb',
        libraryTarget: 'umd',
        globalObject: 'this'
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: {
                    loader: 'ts-loader',
                    options: {
                        configFile: path.join(
                            __dirname,
                            `tsconfig.build-${debug ? 'debug' : 'prod'}.json`
                        )
                    }
                }
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js'],
        modules: [path.join(__dirname, '../lib'), path.join(__dirname, '../node_modules')],
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
            banner
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
