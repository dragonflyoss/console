import { defineConfig } from 'umi';

export default defineConfig({
  title: 'Dragonfly',
  nodeModulesTransform: {
    type: 'none',
  },
  favicon: 'logo-dragonfly.png',
  routes: [
    {
      exact: true,
      path: '/',
      component: '@/pages/index',
    },
    { exact: true, path: '/signin', component: '@/pages/index' },
    { exact: true, path: '/installation', component: '@/pages/installation' },
    {
      exact: false,
      path: '/profile',
      component: '@/layouts/index',
      routes: [
        {
          exact: true,
          path: '/profile/:id',
          component: '@/pages/profile',
        },
      ],
    },
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
          path: '/configuration/seed-peer-cluster',
          component: '@/pages/cdn',
        },
        {
          exact: true,
          path: '/configuration/application',
          component: '@/pages/application',
        },
        {
          exact: true,
          path: '/configuration/security',
          component: '@/pages/security',
        },
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
          path: '/setting/user',
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
          path: '/service/task',
          component: '@/pages/task',
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
  proxy: {
    '/api/v1': {
      target: ' http://dragonfly-manager.com:8080', //dep env
      //detele-commit-name--4
    },
  },
  fastRefresh: {},
  theme: {
    'primary-color': '#23B066',
  },
});
