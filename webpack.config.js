const PugPlugin = require('pug-plugin');
const path = require('path');
const {CleanWebpackPlugin} = require("clean-webpack-plugin");
const SVGSpritemapPlugin = require('svg-spritemap-webpack-plugin');

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
        new SVGSpritemapPlugin('src/images/svg/**/*.svg', {
            output: {
                filename: '../src/images/sprites/sprite.svg',
                svgo: true,
                svg4everybody: true,
                chunk: { keep: true }
            },
            sprite: {
                prefix: "",
            },
            styles: {
                keepAttributes: true,
            }
        }),
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
                use: ['css-loader', {
                    loader: 'sass-loader',
                    options: {
                        // Отключаем warnings на import'ы bootstrapa
                        warnRuleAsWarning: false,
                        sassOptions: {
                            quietDeps: true,
                            silenceDeprecations: [
                                "legacy-js-api",
                                "global-builtin",
                                "new-global",
                                "color-functions",
                                "import"
                            ],
                        }
                    }
                }],
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
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif|webp)$/i,
                type: 'asset/resource',
            },
        ],
    },

    resolve: {
        extensions: ['.ts', '.js'],
        alias: {
            "~": path.resolve(__dirname, 'node_modules'),
        }
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

    stats: {
        warnings: true
    }
}