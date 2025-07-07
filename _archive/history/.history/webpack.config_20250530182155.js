const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
    library: {
      name: 'playwrightFramework',
      type: 'umd',
    },
  },
  target: 'node',
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: false,
          },
          mangle: true,
          keep_classnames: true,
          keep_fnames: true,
        },
      }),
    ],
  },
  externals: {
    '@playwright/test': '@playwright/test',
  },
};
