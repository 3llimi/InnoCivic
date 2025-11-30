const webpack = require('webpack');

// Config values for build time
const config = {
  BRO_API_BASE_URL: 'https://innocivicapi.ru'
};

export default {
  apiPath: 'stubs/api',
  webpackConfig: {
    output: {
      publicPath: `/static/innocivic/1.1.8/`
    },
    plugins: [
      new webpack.DefinePlugin({
        __API_BASE_URL__: JSON.stringify(config.BRO_API_BASE_URL),
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
    BRO_API_BASE_URL: config.BRO_API_BASE_URL
  }
}