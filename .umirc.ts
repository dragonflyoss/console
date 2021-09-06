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
    default: 'en-US', // en-US
    baseNavigator: true,
    antd: true,
  },
  fastRefresh: {},
  proxy: {},
  theme: {
    'primary-color': '#23B066',
  },
});
