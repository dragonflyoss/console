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
    {
      exact: false,
      path: '/setting',
      component: '@/layouts/index',
      routes: [
        {
          exact: true,
          path: '/setting/',
          component: '@/pages/permission',
        },
        {
          exact: true,
          path: '/setting/permission',
          component: '@/pages/permission',
        },
        {
          exact: true,
          path: '/setting/users',
          component: '@/pages/users',
        },
        {
          exact: true,
          path: '/setting/oauth',
          component: '@/pages/oauth',
        },
      ],
    },
    {
      exact: false,
      path: '/service',
      component: '@/layouts/index',
      routes: [
        {
          exact: true,
          path: '/service/',
          component: '@/pages/task',
        },
        {
          exact: true,
          path: '/service/task-list',
          component: '@/pages/task',
        },
        // {
        //   exact: true,
        //   path: '/service/system-call',
        //   component: '@/pages/systemCall',
        // },
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
  proxy: {
    '/api/v1': {
      target: 'http://11.122.75.66:8080', // dep env
    },
  },
  fastRefresh: {},
  theme: {
    'primary-color': '#23B066',
  },
});
