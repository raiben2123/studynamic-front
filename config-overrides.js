const webpack = require('webpack');

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
    ];

    // Configuración de producción
    if (env === 'production') {
        // Optimizaciones para producción
        config.optimization.minimize = true;
        
        // Dividir código en chunks más pequeños para mejor carga
        config.optimization.splitChunks = {
            chunks: 'all',
            maxInitialRequests: Infinity,
            minSize: 0,
            cacheGroups: {
                vendor: {
                    test: /[\\]node_modules[\\]/,
                    name(module) {
                        // Obtener el nombre del paquete
                        const packageName = module.context.match(/[\\]node_modules[\\](.+?)([\\]|$)/)[1];
                        // Reemplazar @ y / con guiones
                        return `npm.${packageName.replace('@', '').replace('/', '-')}`;
                    },
                },
            },
        };
    }

    return config;
};