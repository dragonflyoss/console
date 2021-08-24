import { defineConfig } from 'umi';

export default defineConfig({
  title: '蜻蜓-文件分发',
  nodeModulesTransform: {
    type: 'none',
  },
  routes: [
    {
      exact: false,
      path: '/',
      component: '@/layouts/index',
      routes: [
        { exact: true, path: '/', component: '@/pages/index' },
        { exact: true, path: '/scheduler', component: '@/pages/index' },
        { exact: true, path: '/cdn', component: '@/pages/cdn' },
      ],
    },
  ],
  locale: {
    default: 'zh-CN', //默认语言 zh-CN
    baseNavigator: true, // 为true时，用navigator.language的值作为默认语言
    antd: true, // 是否启用antd的<LocaleProvider />
  },
  fastRefresh: {},
});
