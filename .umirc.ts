import { defineConfig } from 'umi';

export default defineConfig({
  title: 'Dragonfly',
  nodeModulesTransform: {
    type: 'none',
  },
  routes: [
    { exact: true, path: '/signin', component: '@/pages/index' },
    { exact: true, path: '/signup', component: '@/pages/index' },
    {
      exact: false,
      path: '/',
      component: '@/layouts/index',
      routes: [
        { exact: true, path: '/', component: '@/pages/scheduler' },
        { exact: true, path: '/scheduler', component: '@/pages/scheduler' },
        { exact: true, path: '/cdn', component: '@/pages/cdn' },
      ],
    },
  ],
  locale: {
    default: 'en-US', //默认语言 en-US
    baseNavigator: true, // 为true时，用navigator.language的值作为默认语言
    antd: true, // 是否启用antd的<LocaleProvider />
  },
  fastRefresh: {},
  proxy: {
    '/api/v1': {
      target: 'http://11.122.75.66:8080', // dep env
    },
  },
  theme: {
    'primary-color': '#23B066',
  },
});
