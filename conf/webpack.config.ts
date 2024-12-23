import * as path from 'path';
import * as webpack from 'webpack';
import TerserPlugin from 'terser-webpack-plugin';

import * as pkg from '../package.json';

const debug = process.argv.indexOf('--mode=development') > 0;
const license = `opensource.org/licenses/${pkg.license}`;
const copyright = `(c) ${new Date().getFullYear()} ${pkg.author}, ${license}`;
const banner = `kdbxweb v${pkg.version}, ${copyright}`;

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
        modules: [
            path.join(__dirname, '../util'),
            path.join(__dirname, '../node_modules')
        ],
        alias: {
            '@': path.resolve(__dirname, '../')
        },
        fallback: {
            console: false,
            process: false,
            Buffer: false,
            crypto: false,
            zlib: false
        }
    },
    plugins: [new webpack.BannerPlugin({ banner })],
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
        crypto: true,
        zlib: true,
        '@xmldom/xmldom': true
    },
    performance: {
        hints: false
    },
    stats: {
        builtAt: false,
        env: false,
        hash: false,
        colors: true,
        modules: true,
        reasons: true,
        children: true,
        warnings: false,
        errorDetails: false,
        errorStack: false,
        errorsCount: false,
        logging: false, // false, 'none' | 'error' | 'warn' | 'info' | 'log' | 'verbose'
        loggingTrace: false
    }
};
