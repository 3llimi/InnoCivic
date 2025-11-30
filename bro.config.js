export default {
  apiPath: 'stubs/api',
  webpackConfig: {
    output: {
      publicPath: '/static/innocivic/master/'
    }
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
  }
}