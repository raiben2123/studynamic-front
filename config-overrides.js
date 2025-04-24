const webpack = require('webpack');

module.exports = function override(config, env) {
    // Deshabilitar minificación
    if (env === 'production') {
        config.optimization.minimize = false;

        // Eliminar TerserPlugin que minifica el código
        config.optimization.minimizer = [];
    }

    return config;
};