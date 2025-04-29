const { resolve } = require('path');

module.exports = {
  target: 'node',
  entry: {
    main: './src/index.ts',
  },
  output: {
    path: resolve(__dirname, '../../dist/apps/worker'),
    filename: 'index.js',
    library: {
      type: 'commonjs2',
    },
  },
  experiments: {
    outputModule: false
  },
  module: {
    rules: [
        {
            test: /\.ts$/,
            exclude: [/node_modules/],
            loader: 'builtin:swc-loader',
            options: {
              jsc: {
                parser: {
                  syntax: 'typescript',
                },
                transform: {
                  legacyDecorator: true,
                  decoratorMetadata: true
                },
                minify: {
                  compress: false,
                  mangle: false
                }
              },
            },
            type: 'javascript/auto',
        },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
  },
  externals: [
    // 모든 node_modules를 외부화
    ({ request }, callback) => {
      if (/^[a-zA-Z0-9@][^:]*$/.test(request)) {
        // request가 상대 경로 또는 절대 경로가 아닌 경우(node_modules 모듈)
        return callback(null, `commonjs ${request}`);
      }
      callback();
    },
  ],
  mode: 'development', // 'production', 또는 'development'
  target: 'node',
  devtool: 'source-map',
};
