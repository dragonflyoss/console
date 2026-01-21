import { defineConfig } from 'cypress';
import cypressSplit from 'cypress-split';

export default defineConfig({
  // setupNodeEvents can be defined in either
  // the e2e or component configuration
  e2e: {
    setupNodeEvents(on, config) {
      require('@cypress/code-coverage/task')(on, config);
      cypressSplit(on, config);

      // 优化内存使用
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.name === 'chrome') {
          launchOptions.args.push('--disable-dev-shm-usage');
          launchOptions.args.push('--no-sandbox');
          launchOptions.args.push('--disable-gpu');
          launchOptions.args.push('--disable-web-security');
          launchOptions.args.push('--disable-features=VizDisplayCompositor');
        }
        return launchOptions;
      });

      // It's IMPORTANT to return the config object
      // with any changed environment variables
      return config;
    },
    baseUrl: 'http://localhost:3000',
    // 优化配置
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false, // 禁用视频录制提升速度
    // screenshot: false, // 禁用截图提升速度
    defaultCommandTimeout: 10000, // 减少超时时间
    requestTimeout: 10000,
    responseTimeout: 30000,
    pageLoadTimeout: 60000,
    retries: {
      runMode: 1, // CI环境下重试次数
      openMode: 0,
    },
  },
  // 全局优化
  videoCompression: false,
  trashAssetsBeforeRuns: true,
  chromeWebSecurity: false,
});
