const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExstractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');


const isDev = process.env.NODE_ENV === 'development';
console.log(isDev);
const isProd = !isDev;

const optimization = () => {
    const config = {
        splitChunks: {
            chunks: 'all'
        }
    }
    if (isProd) {
        config.minimizer = [
            new OptimizeCssAssetsPlugin(),
            new TerserWebpackPlugin()
        ]
    }
    return config
}

const filename = ext => isDev ? `[name].${ext}` : `[name].[hash].${ext}`

const styleLoaders = extra => {
    const loaders = [{
        loader: MiniCssExstractPlugin.loader,
        options: {
            hmr: isDev,
            reloadAll: true
        },
    }, 'css-loader']
    if (extra) {
        loaders.push(extra)
    }
    return loaders
}

const babelOptions = preset => {
    const opts = {
        presets: [
            '@babel/preset-env',
        ],
        plugins: [
            '@babel/plugin-proposal-class-properties'
        ]
    }
    if (preset) {
        opts.presets.push(preset)
    }
    return opts
}

const jsLoaders = () => {
    const loaders = [{
        loader: 'babel-loader',
        options: babelOptions()
    }]
    if (isDev) {
        loaders.push('eslint-loader');
    }
    return loaders;
}

const allPlugins = wantAnalyze => {
    const base = [
        new HTMLWebpackPlugin({
            template: './index.html',
            minify: {
                collapseWhitespace: isProd
            }
        }),
        new CleanWebpackPlugin(),
        new MiniCssExstractPlugin({
            filename: filename('css')
        })
    ];
    if (isProd && wantAnalyze) {
        base.push(new BundleAnalyzerPlugin());
    }
    return base;
}


module.exports = {
    context: path.resolve(__dirname, 'src'),
    mode: 'development',
    entry: {
        main: ['@babel/polyfill', './scripts/main.js']
    },
    output: {
        filename: filename('js'),
        path: path.resolve(__dirname, 'dist')
    },
    resolve: {
        extensions: ['.js', '.json', '.png'],
        alias: {
            '@scripts': path.resolve(__dirname, 'src/scripts'),
            '@': path.resolve(__dirname, 'src')
        }
    },
    optimization: optimization(),
    devServer: {
        port: 4200,
        hot: !isDev
    },
    devtool: isDev ? 'source-map' : '',
    plugins: allPlugins(false),
    module: {
        rules: [
            {
                test: /\.css$/,
                use: styleLoaders()
            },
            {
                test: /\.s[ac]ss$/,
                use: styleLoaders('sass-loader')
            },
            {
                test: /\.(ogg|mp3|wav|mpe?g|png|jpg|svg|gif|cur)$/,
                loader: 'file-loader',
                options: {
                    name: '[path][name].[ext]',
                },
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: jsLoaders()
            }
        ]
    }
}