import { defineConfig } from 'cypress';
import cypressSplit from 'cypress-split';

export default defineConfig({
  // setupNodeEvents can be defined in either
  // the e2e or component configuration
  e2e: {
    setupNodeEvents(on, config) {
      require('@cypress/code-coverage/task')(on, config);
      cypressSplit(on, config);
      // include any other plugin code...

      // It's IMPORTANT to return the config object
      // with any changed environment variables
      return config;
    },
    baseUrl: 'http://localhost:3000',
    video: false,
    // screenshot: false,
    viewportWidth: 1280,
    viewportHeight: 720,
  },
  defaultCommandTimeout: 10000,
  responseTimeout: 30000,
  pageLoadTimeout: 60000,
  retries: {
    runMode: 2,
    openMode: 0,
  },
});
