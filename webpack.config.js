const PugPlugin = require('pug-plugin');
const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const {CleanWebpackPlugin} = require("clean-webpack-plugin");

module.exports = {
    mode: 'development',

    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
    },

    plugins: [
        new PugPlugin({
            entry: {
                index: 'src/views/index.pug',
            }
        }),
        new CleanWebpackPlugin(),
    ],

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.(css|sass|scss)$/,
                use: ['css-loader', 'sass-loader'],
            },
            {
                test: /\.(woff(2)?|ttf|otf|eot|svg)$/,
                type: 'asset/resource',
                include: /assets\/fonts|node_modules/, // fonts from `assets/fonts` or `node_modules` directory only
                generator: {
                    // generates filename including last directory name to group fonts by name
                    filename: (pathData) => `fonts/${path.basename(
                        path.dirname(pathData.filename))}/[name][ext][query]`,
                },
            }
        ],
    },

    resolve: {
        extensions: ['.ts', '.js'],
    },

    devtool: 'inline-source-map',

    devServer: {
        static: './dist',
        watchFiles: {
            paths: ['src/**/*.*',],
        }
    },

    optimization: {
        runtimeChunk: 'single',
    },
}