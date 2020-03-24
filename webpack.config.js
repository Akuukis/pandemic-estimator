/* eslint-disable */
require('dotenv').config()
const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin');

const sourcePath = path.join(__dirname, './src');
const IS_PRODUCTION = process.argv.indexOf('production') >= 0;

const DIST_DIR = path.join(__dirname, 'dist')

module.exports = {
    mode: IS_PRODUCTION ? 'production' : 'development',
    entry: {
        main: [
            'core-js/stable',
            'regenerator-runtime/runtime',
            './src/index',
        ],
    },
    output: {
        path: DIST_DIR,
        filename: '[name].js',
        chunkFilename: '[name].bundle.js',
    },
    devtool: 'inline-source-map',
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx"],
        alias: {
            'react-dom': '@hot-loader/react-dom',
            'react': path.resolve(__dirname, 'node_modules', 'react'),  // https://github.com/wko27/react-mathjax/issues/11
        },
    },
    externals: [
        'static/*'
    ],
    module: {
        rules: [
            { test: /\.css$/, loaders: [ 'style-loader', 'css-loader' ] },
            { test: /\.html$/, use: 'html-loader' },
            { test: /\.svg$/, use: 'file-loader?name=img/[name].[ext]?[hash]' },
            { test: /\.jpg$/, use: 'file-loader?name=img/[name].[ext]?[hash]' },
            { test: /\.png$/, use: 'file-loader?name=img/[name].[ext]?[hash]' },
            { test: /\.woff2?$/, use: 'file-loader?name=fonts/[name].[ext]?[hash]' },

            {
                test: /\.(j|t)sx?$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        cacheDirectory: true,
                        babelrc: false,
                        presets: [
                            [
                                "@babel/preset-env",
                                { targets: { browsers: "> 1%" } } // or whatever your project requires
                            ],
                            "@babel/preset-typescript",
                            "@babel/preset-react"
                        ],
                        plugins: [
                            // plugin-proposal-decorators is only needed if you're using experimental decorators in TypeScript
                            ["@babel/plugin-proposal-decorators", { legacy: true }],
                            ["@babel/plugin-proposal-class-properties", { loose: true }],
                            ["@babel/plugin-proposal-optional-chaining"],
                            ["@babel/plugin-proposal-nullish-coalescing-operator"],
                            // "react-hot-loader/babel",  // Breaks RHL: https://github.com/gaearon/react-hot-loader/issues/1236
                        ]
                    }
                }
            },
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(IS_PRODUCTION ? 'production' : 'development'),
            '__MATOMO_SITE_ID__': Number(process.env.matomo_site_id),
            '__MATOMO_URL__': JSON.stringify(process.env.matomo_url),
        }),
        new ForkTsCheckerWebpackPlugin({silent: process.argv.includes('--json')}),
        new webpack.NamedModulesPlugin(),
        new CopyPlugin([
            path.join('static', 'matomo.js'),
        ]),
        new HtmlWebpackPlugin({template: path.join('static', 'index.html') }),
        new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en-gb/)  // Leave out moment.js locales.
    ],

    // Move modules that occur in multiple entry chunks to a new entry chunk (the commons chunk).
    optimization: {
        splitChunks: {
            cacheGroups: {
                commons: {
                    chunks: 'initial',
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendor',
                },
            },
        },
    },

    devServer: {
        https: true,
        historyApiFallback: true,  // for SPA to fallback to index.
    }

}
