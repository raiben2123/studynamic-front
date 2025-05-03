const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = function override(config, env) {
    // Configuración para compatibilidad con Capacitor
    config.resolve.fallback = {
        ...config.resolve.fallback,
        "crypto": require.resolve("crypto-browserify"),
        "buffer": require.resolve("buffer/"),
        "stream": require.resolve("stream-browserify"),
        "assert": require.resolve("assert/"),
        "http": require.resolve("stream-http"),
        "https": require.resolve("https-browserify"),
        "os": require.resolve("os-browserify/browser"),
        "url": require.resolve("url/"),
        "process/browser": require.resolve("process/browser"),
        "process": require.resolve("process/browser"),
    };

    // Agregar plugins necesarios
    config.plugins = [
        ...config.plugins,
        new webpack.ProvidePlugin({
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer'],
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
            'process.env.BUILD_TIME': JSON.stringify(new Date().toISOString()),
        }),
    ];

    // Configuración de producción
    if (env === 'production') {
        // Desactivar source maps en producción
        config.devtool = false;

        // Optimizaciones para producción
        config.optimization = {
            ...config.optimization,
            minimize: true,
            minimizer: [
                new TerserPlugin({
                    terserOptions: {
                        parse: {
                            ecma: 8,
                        },
                        compress: {
                            ecma: 5,
                            warnings: false,
                            comparisons: false,
                            inline: 2,
                            dead_code: true,
                            evaluate: true,
                            unused: true,
                        },
                        mangle: {
                            safari10: true,
                        },
                        output: {
                            ecma: 5,
                            comments: false,
                            ascii_only: true,
                        },
                    },
                    parallel: true,
                }),
            ],
            splitChunks: {
                chunks: 'all',
                maxInitialRequests: Infinity,
                minSize: 20000,
                maxSize: 244000,
                cacheGroups: {
                    vendor: {
                        test: /[\\/]node_modules[\\/]/,
                        priority: -10,
                        reuseExistingChunk: true,
                        name(module) {
                            const packageName = module.context.match(
                                /[\\/]node_modules[\\/](.+?)([\\/]|$)/
                            )[1];
                            return `npm.${packageName.replace('@', '').replace('/', '-')}`;
                        },
                    },
                    dateFns: {
                        test: /[\\/]node_modules[\\/]date-fns/,
                        name: 'npm.date-fns',
                        priority: 20,
                        reuseExistingChunk: true,
                    },
                    react: {
                        test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
                        name: 'npm.react',
                        priority: 30,
                        reuseExistingChunk: true,
                    },
                    default: {
                        minChunks: 2,
                        priority: -20,
                        reuseExistingChunk: true,
                    },
                },
            },
            runtimeChunk: {
                name: entrypoint => `runtime-${entrypoint.name}`,
            },
        };

        // Configuración adicional para el manejo de módulos
        config.module.rules.push({
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: [
                        ['@babel/preset-env', {
                            targets: {
                                browsers: ['last 2 versions', 'not dead', 'not ie 11']
                            },
                            modules: false,
                            useBuiltIns: 'usage',
                            corejs: 3,
                        }],
                        '@babel/preset-react'
                    ],
                    plugins: [
                        '@babel/plugin-transform-runtime',
                        '@babel/plugin-proposal-object-rest-spread',
                    ],
                },
            },
        });

        // Configuración para el manejo de imágenes y assets
        config.module.rules.push({
            test: /\.(png|jpg|jpeg|gif|svg|webp)$/,
            type: 'asset',
            parser: {
                dataUrlCondition: {
                    maxSize: 10 * 1024 // 10kb
                }
            }
        });
    }

    return config;
};