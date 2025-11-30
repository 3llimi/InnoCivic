export default {
  apiPath: 'stubs/api',
  webpackConfig: {
    output: {
      publicPath: '/static/master/'
    }
  },
  /* use https://admin.bro-js.ru/ to create config, navigations and features */
  navigations: {
    'InnoCivic.main': '/innocivic',
  },
  features: {
    'InnoCivic': {
      // add your features here in the format [featureName]: { value: string }
    },
  },
  config: {
  }
}