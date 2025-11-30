export default {
  apiPath: 'stubs/api',
  webpackConfig: {
    output: {
      publicPath: '/static/innocivic/master/',
      library: {
        name: 'innocivic',
        type: 'umd'
      }
    }
  },
  /* use https://admin.bro-js.ru/ to create config, navigations and features */
  navigations: {
    'InnoCivic.main': '/innocivic',
  },
  features: {
    'innocivic': {},
  },
  config: {
  }
}