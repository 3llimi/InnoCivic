export default {
  name: 'Innocivic',
  id: 'Innocivic',
  apiPath: 'stubs/api',
  webpackConfig: {
    output: {
      publicPath: '/static/master/'
    }
  },
  /* use https://admin.bro-js.ru/ to create config, navigations and features */
  navigations: {
    'Innocivic.main': '/innocivic',
  },
  features: {
    'innocivic': {
      // add your features here in the format [featureName]: { value: string }
    },
  },
  config: {
  }
}