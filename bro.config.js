const webpack = require('webpack');

export default {
  apiPath: 'stubs/api',
  webpackConfig: {
    output: {
      publicPath: `/static/innocivic/1.1.6/`
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.BRO_API_BASE_URL': JSON.stringify(process.env.BRO_API_BASE_URL || 'http://localhost:8000'),
      }),
    ],
  },
  /* use https://admin.bro-js.ru/ to create config, navigations and features */
  navigations: {
    'innocivic.main': '/innocivic',
  },
  features: {
    'innocivic': {
      // add your features here in the format [featureName]: { value: string }
    },
  },
  config: {
    BRO_API_BASE_URL: 'https://innocivicapi.ru'
  }
}