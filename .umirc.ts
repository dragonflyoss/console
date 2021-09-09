import { defineConfig } from 'umi';

export default defineConfig({
  title: 'Dragonfly',
  nodeModulesTransform: {
    type: 'none',
  },
  favicon: '/static/logo-dragonfly.faab8a98.png',
  routes: [
    {
      exact: true,
      path: '/',
      component: '@/pages/index',
    },
    { exact: true, path: '/signin', component: '@/pages/index' },
    {
      exact: false,
      path: '/configuration',
      component: '@/layouts/index',
      routes: [
        {
          exact: true,
          path: '/configuration/',
          component: '@/pages/scheduler',
        },
        {
          exact: true,
          path: '/configuration/scheduler-cluster',
          component: '@/pages/scheduler',
        },
        {
          exact: true,
          path: '/configuration/cdn-cluster',
          component: '@/pages/cdn',
        },
        { component: '@/pages/404' },
      ],
    },
    { component: '@/pages/404' },
  ],
  locale: {
    default: 'en-US', // en-US
    baseNavigator: true,
    antd: true,
  },
  fastRefresh: {},
  theme: {
    'primary-color': '#23B066',
  },
});
