/**
 * 在生产环境 代理是无法生效的，所以这里没有生产环境的配置
 * -------------------------------
 * The agent cannot take effect in the production environment
 * so there is no configuration of the production environment
 * For details, please see
 * https://pro.ant.design/docs/deploy
 */
export default {
  dev: {
    // 配置代理
    '/api/': {
      target: 'http://localhost:5000',
      changeOrigin: true,
      pathRewrite: {
        '^/api': ' ',
      },
    },
    '/api1/': {
      target: 'http://localhost:5001',
      changeOrigin: true,
      pathRewrite: {
        '^/api1': ' ',
      },
    },
    // 后端接口
    '/wegismarkapi/': {
      target: 'http://localhost:1290',
      // target: 'http://10.101.240.70:1290',
      changeOrigin: true,
      pathRewrite: {
        '^/wegismarkapi': ' ',
      },
    },
    // geoserver接口
    '/api3/': {
      target: 'http://localhost:8060/geoserver/rest',
      // target: 'http://10.101.240.70:8060/geoserver/rest',
      changeOrigin: true,
      pathRewrite: {
        '^/api3': ' ',
      },
    },
  },
  test: {
    '/api/': {
      target: 'https://preview.pro.ant.design',
      changeOrigin: true,
      pathRewrite: {
        '^': '',
      },
    },
  },
  pre: {
    '/api/': {
      target: 'your pre url',
      changeOrigin: true,
      pathRewrite: {
        '^': '',
      },
    },
  },
};
