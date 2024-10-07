const webpack = require('webpack');

module.exports = function override(config, env) {
    config.resolve.fallback = {
        ...config.resolve.fallback,
        "stream": require.resolve('stream-browserify'),
        "assert": require.resolve('assert/'),
        "http": require.resolve('stream-http'),
        "https": require.resolve('https-browserify'),
        "os": require.resolve('os-browserify/browser'),
        "url": require.resolve('url/'),
        "buffer": require.resolve('buffer/'),
    };

    config.plugins = [
        ...(config.plugins || []),
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
            process: 'process/browser',
        }),
    ];

    return config;
};
