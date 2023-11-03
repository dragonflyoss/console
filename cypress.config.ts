import { defineConfig } from 'cypress';

export default defineConfig({
  // setupNodeEvents can be defined in either
  // the e2e or component configuration
  e2e: {
    setupNodeEvents(on, config) {
      require('@cypress/code-coverage/task')(on, config);
      // include any other plugin code...

      // It's IMPORTANT to return the config object
      // with any changed environment variables
      return config;
    },
    baseUrl: 'http://localhost:3000',
  },
  chromeWebSecurity: false,
  defaultCommandTimeout: 15000,
  requestTimeout: 30000,
  pageLoadTimeout: 80000,
  responseTimeout: 60000,
});
