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
  defaultCommandTimeout: 1000,
  responseTimeout: 60000,
});
